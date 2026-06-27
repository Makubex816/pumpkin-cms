# Contact Gate Status

Gate: Ice public contact submissions must persist as Pumpkin CMS `FormEntry` records visible in Admin.

Status: OPEN.

## Why open

The static contact adapter can now forward to Pumpkin API locally, but the live Pumpkin API runtime does not exist in current Web App metadata. Without a verified API host, there is no safe target for `PUMPKIN_API_URL`.

## What closes the gate

1. Pumpkin API live App Service exists.
2. API health passes.
3. API is bound to production Cosmos provider.
4. Admin is bound to the same API URL.
5. Isolated static contact writes one approved no-PII entry.
6. Admin returns the same `FormEntry` id.
7. Backup Center/resource registry evidence is refreshed.
8. Production binding is separately approved and passes readback.
