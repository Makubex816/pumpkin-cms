# Party Pros Submit-Key Provisioning V2.8.61OSF

OSF completed submit-key provisioning for tenant `party-pros-philadelphia`.

Provisioning facts:

- OSE route activation was committed at `b4fab935`.
- No-secret route probe returned `401`, proving the route was live and protected.
- SuperAdmin-authenticated provisioning returned `200`.
- The route reported key-hash storage without returning plaintext key or key hash.
- The starter app received only `PUMPKIN_TENANT_ID` and `PUMPKIN_API_KEY`.
- The starter app was restarted once and not redeployed.

Secret handling:

- Submit key value was read from the approved ignored handoff.
- No credential, JWT, submit key, appsetting value, or key hash was printed.

