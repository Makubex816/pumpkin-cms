import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const storageResource = 'https://storage.azure.com/';
const blobRestVersion = '2021-12-02';

export class AzureBlobDataPlaneError extends Error {
  constructor({ statusCode, code, message, operation }) {
    super(message);
    this.name = 'AzureBlobDataPlaneError';
    this.statusCode = statusCode;
    this.code = code;
    this.operation = operation;
  }
}

export class AzureBlobRbacReadClient {
  constructor({ accountName, tokenProvider = getAzureCliStorageAccessToken, fetchImpl = globalThis.fetch }) {
    if (!fetchImpl) {
      throw new Error('global fetch is not available in this Node runtime');
    }
    this.accountName = accountName;
    this.tokenProvider = tokenProvider;
    this.fetchImpl = fetchImpl;
    this.endpoint = `https://${accountName}.blob.core.windows.net`;
    this.accessToken = null;
  }

  async verifyAccess({ containerName }) {
    await this.listBlobs({ containerName, maxResults: 1 });
    return { status: 'available', authMode: 'azure-ad-rbac', tokenPrinted: false, tokenPersisted: false };
  }

  async listBlobs({ containerName, prefix = '', maxResults = 5000 }) {
    const blobs = [];
    let marker = '';
    do {
      const query = new URLSearchParams({
        restype: 'container',
        comp: 'list',
        include: 'metadata',
        maxresults: String(maxResults)
      });
      if (prefix) query.set('prefix', prefix);
      if (marker) query.set('marker', marker);
      const response = await this.request({
        method: 'GET',
        path: `/${encodePathSegment(containerName)}?${query.toString()}`,
        operation: `list-blobs:${containerName}`,
        parse: 'text'
      });
      const parsed = parseBlobListXml(response);
      blobs.push(...parsed.blobs);
      marker = parsed.nextMarker;
    } while (marker);
    return blobs.sort((left, right) => left.name.localeCompare(right.name));
  }

  async downloadBlobToFile({ containerName, blobName, filePath }) {
    const buffer = await this.request({
      method: 'GET',
      path: `/${encodePathSegment(containerName)}/${encodeBlobPath(blobName)}`,
      operation: `download-blob:${containerName}`,
      parse: 'arrayBuffer'
    });
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, Buffer.from(buffer));
    return {
      byteSize: Buffer.byteLength(Buffer.from(buffer))
    };
  }

  async request({ method, path: requestPath, operation, parse }) {
    const token = await this.getAccessToken();
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const response = await this.fetchImpl(`${this.endpoint}${requestPath}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'x-ms-date': new Date().toUTCString(),
          'x-ms-version': blobRestVersion
        }
      });
      if ((response.status === 429 || response.status === 503) && attempt < 6) {
        await sleep(retryDelayMs(response, attempt));
        continue;
      }
      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new AzureBlobDataPlaneError({
          statusCode: response.status,
          code: response.status === 401 || response.status === 403 ? 'DATA_PLANE_ACCESS_DENIED' : 'DATA_PLANE_REQUEST_FAILED',
          message: sanitizeBlobMessage(text || response.statusText),
          operation
        });
      }
      if (parse === 'arrayBuffer') {
        return response.arrayBuffer();
      }
      return response.text();
    }
    throw new Error(`Blob request retry loop exited unexpectedly for ${operation}`);
  }

  async getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = await this.tokenProvider();
    }
    return this.accessToken;
  }
}

export async function getAzureCliStorageAccessToken() {
  const command = process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'az';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'az', 'account', 'get-access-token', '--resource', storageResource, '--query', 'accessToken', '-o', 'tsv']
    : ['account', 'get-access-token', '--resource', storageResource, '--query', 'accessToken', '-o', 'tsv'];
  const { stdout } = await execFileAsync(command, args, { windowsHide: true, maxBuffer: 1024 * 1024 });
  const token = stdout.trim();
  if (!token) {
    throw new Error('Azure CLI did not return a Storage access token');
  }
  return token;
}

function parseBlobListXml(xml) {
  const blobs = [];
  const blobPattern = /<Blob>([\s\S]*?)<\/Blob>/g;
  for (const match of xml.matchAll(blobPattern)) {
    const blobXml = match[1];
    blobs.push({
      name: xmlDecode(readXmlField(blobXml, 'Name')),
      contentType: xmlDecode(readXmlField(blobXml, 'Content-Type')),
      contentLength: Number(readXmlField(blobXml, 'Content-Length') || 0),
      lastModified: xmlDecode(readXmlField(blobXml, 'Last-Modified')),
      etag: stripQuotes(xmlDecode(readXmlField(blobXml, 'Etag'))),
      blobType: xmlDecode(readXmlField(blobXml, 'BlobType'))
    });
  }
  return {
    blobs,
    nextMarker: xmlDecode(readXmlField(xml, 'NextMarker'))
  };
}

function readXmlField(xml, fieldName) {
  const pattern = new RegExp(`<${fieldName}>([\\s\\S]*?)<\\/${fieldName}>`);
  return pattern.exec(xml)?.[1] ?? '';
}

function xmlDecode(value) {
  return String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function stripQuotes(value) {
  return String(value).replace(/^"|"$/g, '');
}

function encodeBlobPath(blobName) {
  return String(blobName).split('/').map(encodePathSegment).join('/');
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

function retryDelayMs(response, attempt) {
  const retryAfterSeconds = Number(response.headers.get('Retry-After'));
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, 10000);
  }
  return Math.min(250 * 2 ** (attempt - 1), 8000);
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function sanitizeBlobMessage(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer REDACTED')
    .replace(/sig=[A-Za-z0-9._%-]+/gi, 'sig=REDACTED')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, 'JWT_REDACTED')
    .slice(0, 800);
}
