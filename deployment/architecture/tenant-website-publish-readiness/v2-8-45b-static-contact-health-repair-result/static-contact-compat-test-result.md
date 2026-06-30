# Static Contact Compat Test Result

Command:

`npm test --prefix deployment/static-azure/forms/static-form-endpoint-compat`

Result: pass.

Passed checks included:

- Health sentinel success.
- OPTIONS preflight.
- Frontend alias payload in dry-run mode.
- Dry-run/no-email modes do not call Pumpkin API persistence.
- Pumpkin API mode request shaping.
- Public-safe upstream auth and server error mapping.
- Missing Pumpkin config safe failure before persistence.
- Validation failures before persistence.

No contact POST was sent to production or isolated.

