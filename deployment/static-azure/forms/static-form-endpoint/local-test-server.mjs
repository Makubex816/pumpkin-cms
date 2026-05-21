import http from 'node:http';
import { handleStaticContactRequest } from './contact-handler.mjs';

const port = Number.parseInt(process.env.STATIC_FORM_LOCAL_PORT || '7072', 10);
const maxBodyBytes = Number.parseInt(process.env.STATIC_FORM_MAX_BODY_BYTES || '20000', 10);

const server = http.createServer(async (request, response) => {
  if (request.url !== '/api/contact') {
    writeJson(response, 404, { ok: false, message: 'Not found.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    const result = await handleStaticContactRequest({
      method: 'OPTIONS',
      headers: request.headers,
      body: {},
    });
    writeJson(response, result.status, result.body, result.headers);
    return;
  }

  if (request.method !== 'POST') {
    writeJson(response, 405, { ok: false, message: 'Only POST is supported.' });
    return;
  }

  try {
    const body = await readRequestBody(request, maxBodyBytes);
    const result = await handleStaticContactRequest({
      method: 'POST',
      headers: request.headers,
      body,
    });

    writeJson(response, result.status, result.body, result.headers);
  } catch (error) {
    const status = error?.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
    writeJson(response, status, {
      ok: false,
      message: status === 413 ? 'Request is too large.' : 'Invalid request body.',
    });
  }
});

server.listen(port, () => {
  console.log(`Static form endpoint local test server listening on http://localhost:${port}/api/contact`);
  console.log('Use STATIC_FORM_FORWARD_MODE=dry-run for validation-only local tests without Pumpkin API credentials.');
});

function readRequestBody(request, limitBytes) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > limitBytes) {
        const error = new Error('payload too large');
        error.code = 'PAYLOAD_TOO_LARGE';
        reject(error);
        request.destroy();
        return;
      }

      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function writeJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(JSON.stringify(body));
}
