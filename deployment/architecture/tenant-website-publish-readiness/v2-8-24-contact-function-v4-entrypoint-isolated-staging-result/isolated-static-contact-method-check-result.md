# Isolated Static Contact Method Check Result

Endpoint checked:

`https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact`

Method: `OPTIONS`

Result:

- Status: 204
- Body length: 0
- Result OK: true
- `Access-Control-Allow-Origin` header observed by Node fetch: null
- `Access-Control-Allow-Methods` header observed by Node fetch: null

This matched the prior isolated behavior where preflight returned 204 even though POST later returned 404.
