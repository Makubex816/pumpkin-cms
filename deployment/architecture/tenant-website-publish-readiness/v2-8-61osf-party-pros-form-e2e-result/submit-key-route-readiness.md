# Submit-Key Route Readiness

Route:

- `POST https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/tenants/party-pros-philadelphia/submit-key`

No-secret readiness probe:

- Method: POST
- Auth: none
- Body: empty object
- Result: `401`
- Classification: route live and protected.

This cleared the route-live gate. OSF did not continue while the route was `404`.

