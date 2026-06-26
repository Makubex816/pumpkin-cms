module.exports = async function staticContact(context, req) {
  const { handleStaticContactRequest } = await import('../contact-handler.mjs');
  const method = String(req?.method || 'GET').toUpperCase();
  const body = method === 'OPTIONS' ? {} : readRequestBody(req);

  const result = await handleStaticContactRequest({
    method,
    headers: req?.headers || {},
    body,
    env: process.env,
    fetchImpl: fetch,
    now: () => new Date(),
    logger: context,
  });

  context.res = {
    status: result.status,
    headers: result.headers,
  };

  if (result.status !== 204) {
    context.res.body = result.body;
  }
};

function readRequestBody(req) {
  if (!req) return '{}';
  if (typeof req.rawBody === 'string') return req.rawBody;
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return req.body;
  return '{}';
}
