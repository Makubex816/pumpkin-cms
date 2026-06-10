import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cosmosResource = 'https://cosmos.azure.com/';
const cosmosRestVersion = '2018-12-31';
const systemFields = new Set(['_rid', '_self', '_etag', '_attachments', '_ts']);

export class CosmosDataPlaneError extends Error {
  constructor({ statusCode, code, message, operation }) {
    super(message);
    this.name = 'CosmosDataPlaneError';
    this.statusCode = statusCode;
    this.code = code;
    this.operation = operation;
  }
}

export class CosmosAadDataPlaneClient {
  constructor({ accountName, databaseName, tokenProvider = getAzureCliCosmosAccessToken, fetchImpl = globalThis.fetch }) {
    if (!fetchImpl) {
      throw new Error('global fetch is not available in this Node runtime');
    }
    this.accountName = accountName;
    this.databaseName = databaseName;
    this.tokenProvider = tokenProvider;
    this.fetchImpl = fetchImpl;
    this.endpoint = `https://${accountName}.documents.azure.com`;
    this.accessToken = null;
  }

  async verifyAccess({ containerName, tenantKey }) {
    await this.queryTenantCount({ containerName, tenantKey });
    return { status: 'available', authMode: 'azure-ad-rbac', tokenPrinted: false, tokenPersisted: false };
  }

  async queryTenantCount({ containerName, tenantKey }) {
    const response = await this.request({
      method: 'POST',
      path: `/dbs/${encodePathSegment(this.databaseName)}/colls/${encodePathSegment(containerName)}/docs`,
      operation: `query-count:${containerName}`,
      partitionKey: tenantKey,
      headers: {
        'Content-Type': 'application/query+json',
        'x-ms-documentdb-isquery': 'true'
      },
      body: {
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantKey = @tenantKey',
        parameters: [{ name: '@tenantKey', value: tenantKey }]
      }
    });
    const documents = Array.isArray(response?.Documents) ? response.Documents : [];
    const count = Number(documents[0] ?? 0);
    if (!Number.isFinite(count)) {
      throw new CosmosDataPlaneError({
        statusCode: 200,
        code: 'COUNT_PARSE_FAILED',
        message: `Count query response could not be parsed for ${containerName}`,
        operation: `query-count:${containerName}`
      });
    }
    return count;
  }

  async queryTenantDocuments({ containerName, tenantKey }) {
    const documents = [];
    let continuation = null;
    do {
      const response = await this.request({
        method: 'POST',
        path: `/dbs/${encodePathSegment(this.databaseName)}/colls/${encodePathSegment(containerName)}/docs`,
        operation: `query-documents:${containerName}`,
        partitionKey: tenantKey,
        continuation,
        includeResponseHeaders: true,
        headers: {
          'Content-Type': 'application/query+json',
          'x-ms-documentdb-isquery': 'true',
          'x-ms-max-item-count': '100'
        },
        body: {
          query: 'SELECT * FROM c WHERE c.tenantKey = @tenantKey',
          parameters: [{ name: '@tenantKey', value: tenantKey }]
        }
      });
      documents.push(...(Array.isArray(response.body?.Documents) ? response.body.Documents : []));
      continuation = response.headers.continuation;
    } while (continuation);

    return documents
      .map((document) => sortObjectKeys(stripCosmosSystemFields(document)))
      .sort((left, right) => String(left.id ?? '').localeCompare(String(right.id ?? '')));
  }

  async readDocument({ containerName, id, tenantKey }) {
    try {
      return await this.request({
        method: 'GET',
        path: `/dbs/${encodePathSegment(this.databaseName)}/colls/${encodePathSegment(containerName)}/docs/${encodePathSegment(id)}`,
        operation: `read-document:${containerName}`,
        partitionKey: tenantKey
      });
    } catch (error) {
      if (error instanceof CosmosDataPlaneError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async createDocument({ containerName, document, tenantKey }) {
    return this.request({
      method: 'POST',
      path: `/dbs/${encodePathSegment(this.databaseName)}/colls/${encodePathSegment(containerName)}/docs`,
      operation: `create-document:${containerName}`,
      partitionKey: tenantKey,
      headers: {
        'Content-Type': 'application/json'
      },
      body: document
    });
  }

  async request({
    method,
    path,
    operation,
    partitionKey = null,
    headers = {},
    body = null,
    continuation = null,
    includeResponseHeaders = false
  }) {
    const token = await this.getAccessToken();
    const serializedBody = body === null ? undefined : JSON.stringify(body);
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const requestHeaders = {
        Authorization: buildCosmosAadAuthorizationHeader(token),
        'x-ms-date': new Date().toUTCString(),
        'x-ms-version': cosmosRestVersion,
        Accept: 'application/json',
        ...headers
      };
      if (partitionKey !== null) {
        requestHeaders['x-ms-documentdb-partitionkey'] = JSON.stringify([partitionKey]);
      }
      if (continuation) {
        requestHeaders['x-ms-continuation'] = continuation;
      }

      const response = await this.fetchImpl(`${this.endpoint}${path}`, {
        method,
        headers: requestHeaders,
        body: serializedBody
      });
      const text = await response.text();
      if (response.status === 429 && attempt < 6) {
        await sleep(retryDelayMs(response, attempt));
        continue;
      }
      if (!response.ok) {
        throw new CosmosDataPlaneError({
          statusCode: response.status,
          code: response.status === 401 || response.status === 403 ? 'DATA_PLANE_ACCESS_DENIED' : 'DATA_PLANE_REQUEST_FAILED',
          message: sanitizeCosmosMessage(text || response.statusText),
          operation
        });
      }
      const parsed = parseJsonResponse(text);
      if (includeResponseHeaders) {
        return {
          body: parsed,
          headers: {
            continuation: response.headers.get('x-ms-continuation') || null
          }
        };
      }
      return parsed;
    }
    throw new Error(`Cosmos request retry loop exited unexpectedly for ${operation}`);
  }

  async getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await this.tokenProvider();
    }
    return this.accessToken;
  }
}

export async function getAzureCliCosmosAccessToken() {
  const command = process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'az';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'az', 'account', 'get-access-token', '--resource', cosmosResource, '--query', 'accessToken', '-o', 'tsv']
    : ['account', 'get-access-token', '--resource', cosmosResource, '--query', 'accessToken', '-o', 'tsv'];
  const { stdout } = await execFileAsync(
    command,
    args,
    { windowsHide: true, maxBuffer: 1024 * 1024 }
  );
  const token = stdout.trim();
  if (!token) {
    throw new Error('Azure CLI did not return a Cosmos access token');
  }
  return token;
}

export function stripCosmosSystemFields(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return document;
  }
  return Object.fromEntries(Object.entries(document).filter(([key]) => !systemFields.has(key)));
}

export function buildComparableDocument(document) {
  return sortObjectKeys(stripCosmosSystemFields(document));
}

function buildCosmosAadAuthorizationHeader(token) {
  return encodeURIComponent(`type=aad&ver=1.0&sig=${token}`);
}

function parseJsonResponse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function retryDelayMs(response, attempt) {
  const retryAfter = Number(response.headers.get('x-ms-retry-after-ms'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter + 100, 10000);
  }
  return Math.min(250 * 2 ** (attempt - 1), 8000);
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortObjectKeys(item));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, sortObjectKeys(value[key])])
    );
  }
  return value;
}

function sanitizeCosmosMessage(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer REDACTED')
    .replace(/type=aad&ver=1\.0&sig=[A-Za-z0-9._%-]+/gi, 'type=aad&ver=1.0&sig=REDACTED')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, 'JWT_REDACTED')
    .slice(0, 800);
}
