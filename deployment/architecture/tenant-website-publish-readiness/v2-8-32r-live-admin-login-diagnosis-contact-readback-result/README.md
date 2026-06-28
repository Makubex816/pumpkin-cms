# V2.8.32R Live Admin Login Diagnosis Contact Readback Result

Phase status: blocked before Admin auth repair and before production contact POST.

Classification: `provider_store_access_failed`.

V2.8.32R diagnosed the V2.8.32Q live Admin login HTTP 500 using the approved ignored secure file and bounded App Service diagnostic logs. The current 500 is not a JWT issuer, audience, expiration, or Admin seed problem. The live login reaches `POST /api/auth/login`, then fails while opening the configured data store:

- Exception: `System.ArgumentException: The connection string is missing a required property: AccountEndpoint`.
- Source path: login calls `IDatabaseService.GetUserByEmailAsync`, which routes to `CosmosDataConnection` for the Cosmos provider.
- Health remains HTTP 200, but both health endpoints report `providerConfigured:false`.

Per the V2.8.32R hard stop, provider/contact/database secret mutations were not approved, so no provider connection string was changed. No production contact POST was sent.

Contact gate status: open.

