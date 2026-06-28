# Secret Handling And Cleanup Instructions

Secret handling result:

- Read only approved secure file `.tmp/v2-8-32s/secure/live-provider-auth-binding.json`.
- Did not print or write `providerConnectionString`.
- Did not print or write `adminPassword`.
- Did not print or write `adminJwtSecretValue`.
- Did not print or write any bearer token or cookie.
- Did not copy the secure file into this result package.
- Did not stage `.tmp/`.

Cleanup instruction:

After the operator no longer needs the handoff material, delete:

- `.tmp/v2-8-32s/secure/live-provider-auth-binding.json`

Do not stage `.tmp/`.

