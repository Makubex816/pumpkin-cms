# Live Admin Login Result

Status: not run.

Reason:

After provider/JWT appsetting mutation and restart, both health endpoints still reported `providerConfigured:false`. The V2.8.32S gate requires stopping before login when this field is present and false.

Consequences:

- No admin password was sent to the login endpoint in this phase after the failed health gate.
- No bearer token was issued.
- No bearer token was printed or written.

Classification: `provider_binding_not_active`.

