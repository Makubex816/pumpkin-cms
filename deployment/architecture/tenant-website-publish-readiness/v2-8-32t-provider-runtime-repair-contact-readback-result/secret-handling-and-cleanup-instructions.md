# Secret Handling And Cleanup Instructions

Secret handling result:

- Read only `.tmp/v2-8-32t/secure/live-provider-runtime-repair.json`.
- Did not print or write `providerConnectionString`.
- Did not print or write `adminPassword`.
- Did not print or write `adminJwtSecretValue`.
- Did not print or write any bearer token or cookie.
- Did not copy the secure file into this result package.
- Redacted appsetting verification printed only booleans and names.
- Did not stage `.tmp/`.

Cleanup instruction:

After the operator no longer needs the handoff material, delete:

- `.tmp/v2-8-32t/secure/live-provider-runtime-repair.json`

Do not stage `.tmp/`.

