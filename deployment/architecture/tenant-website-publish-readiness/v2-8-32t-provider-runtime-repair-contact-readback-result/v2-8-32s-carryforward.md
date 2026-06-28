# V2.8.32S Carryforward

V2.8.32S completed:

- Secure connection string shape was valid and contained `AccountEndpoint` plus key/token material.
- Set only `Database__Provider`, `Database__CosmosDb__ConnectionString`, `Database__CosmosDb__DatabaseName`, and `Jwt__SecretKey`.
- Restarted the Web App.
- Health remained HTTP 200 with `providerConfigured:false` and `providerStatus:"not_checked"`.
- Source showed the FormEntry container is hardcoded as `FormEntry`; no FormEntry container appsetting exists.
- No Admin login, Admin readback, or production contact POST was run.

V2.8.32T diagnosed the health signal as source-defective and continued to the provider-backed login path.

