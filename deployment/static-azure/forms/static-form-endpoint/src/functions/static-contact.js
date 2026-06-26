const { app } = require('@azure/functions');

app.http('static-contact', {
  methods: ['OPTIONS', 'POST'],
  authLevel: 'anonymous',
  route: 'static-contact',
  handler: async (request, context) => {
    const { handleAzureFunctionStaticContact } = await import('../../azure-function-adapter.mjs');
    return handleAzureFunctionStaticContact(request, context);
  },
});
