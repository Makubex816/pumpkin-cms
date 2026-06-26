# Function v4 Entrypoint Analysis

Entry point inspected:

`deployment/static-azure/forms/static-form-endpoint/src/functions/static-contact.js`

The file registers the function through the Azure Functions Node v4 programming model:

```js
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
```

Analysis:

- The function name is `static-contact`.
- The explicit route is `static-contact`.
- With `host.json` route prefix `api`, the public path should resolve as `/api/static-contact`.
- The wrapper uses CommonJS at the registration layer and dynamically imports the existing ESM adapter.
- The package uses Node v4 registration consistently for the deployed route.
- No deployed `/api/contact` compatibility route is registered.

Result: local entrypoint shape is correct for the intended v4 registration model, but the isolated SWA POST still returned 404 after deployment.
