import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { handleStaticContactRequest } from './contact-handler.mjs';

export async function staticContact(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const result = await handleStaticContactRequest({
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method === 'OPTIONS' ? {} : await request.text(),
    logger: context,
  });

  return {
    status: result.status,
    headers: result.headers,
    jsonBody: result.body,
  };
}

app.http('static-contact', {
  methods: ['OPTIONS', 'POST'],
  authLevel: 'anonymous',
  route: 'static-contact',
  handler: staticContact,
});
