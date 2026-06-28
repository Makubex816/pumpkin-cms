# Admin FormEntry Authenticated Readback Preflight

Approved Admin FormEntry readback URL:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Expected auth shape:

`Authorization: Bearer <token>`

Result:

- Preflight attempted: no.
- Reason: live Admin login returned HTTP `500` and no bearer token was issued.
- Readback status: not applicable.
- OK: no.

Production POST decision:

Stop before POST.

