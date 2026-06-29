# Isolated Admin Readback Result

Readback route:

`https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`

Result:

- Admin readback preflight before POST: HTTP 200.
- Isolated POST status: HTTP 502.
- Admin polling after POST: not run because the POST did not return success.
- Admin-visible V2.8.33A isolated trace: no.
- Admin-visible entry ID: none.

The failed isolated POST created no Admin-visible FormEntry.
