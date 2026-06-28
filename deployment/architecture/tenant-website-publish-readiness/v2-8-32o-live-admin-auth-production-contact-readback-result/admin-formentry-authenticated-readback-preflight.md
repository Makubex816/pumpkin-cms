# Admin FormEntry Authenticated Readback Preflight

Status: not run.

Approved readback URL:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Expected auth shape from source:

`Authorization: Bearer <login token>`

Reason preflight did not run:

Live Admin login was not attempted because Admin/JWT auth binding was blocked by missing `adminJwtSecretValue`.

Production POST decision:

Stop before POST.

