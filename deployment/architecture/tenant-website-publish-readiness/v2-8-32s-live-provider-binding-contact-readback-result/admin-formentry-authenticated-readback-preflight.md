# Admin FormEntry Authenticated Readback Preflight

Status: not run.

Reason:

Live Admin login was not attempted after the failed health gate, so no bearer token was available for:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Gate result:

- Admin bearer available: no.
- Authenticated Admin readback preflight 2xx: no.
- Production contact POST allowed: no.

Classification: `provider_binding_not_active`.

