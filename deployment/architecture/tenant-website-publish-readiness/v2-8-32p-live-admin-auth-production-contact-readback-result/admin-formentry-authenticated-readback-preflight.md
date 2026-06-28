# Admin FormEntry Authenticated Readback Preflight

Approved Admin FormEntry readback URL:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Saved JWT preflight:

- Attempted: yes.
- Status: HTTP `401`.
- OK: no.
- Response body length: `0`.

Binding/login token preflight:

- Attempted: no.
- Reason: binding file lacked `adminJwtSecretValue`, so no login token was obtained.

Production POST decision:

Stop before POST.

