# Live Login 500 Diagnosis

Pre-repair live Admin login result:

- Endpoint: approved live Pumpkin API login endpoint.
- Payload shape: `{ email, password }`.
- Diagnosis correlation header sent: yes.
- HTTP status: 500.
- Bearer token issued: no.
- Response body length: 0.

Diagnosis:

- V2.8.32V proved the Admin identity and password were valid.
- V2.8.32W reconfirmed source requires JWT support settings after password verification.
- V2.8.32T redacted config evidence showed `Jwt__Issuer`, `Jwt__Audience`, and `Jwt__ExpirationMinutes` were absent.
- The login 500 was repaired by setting only those non-secret JWT support settings, proving the blocker was JWT support configuration rather than the Admin identity.

No App Service logs were required for the final diagnosis because source plus prior redacted appsetting evidence and the successful post-repair login were sufficient.
