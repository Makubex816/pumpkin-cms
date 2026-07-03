# Pumpkin Airstrip Production Runtime Proof V2.8.60

Runtime proof passed for the Airstrip production default host.

Default host:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Routes:

- `/`: HTTP 200.
- `/request-booking`: HTTP 200.
- `/packages`: HTTP 200.
- `/airstrip-the-club`: HTTP 200.

Browser diagnostics:

- Console errors: 0.
- Failed requests: 0.
- HTTP 4xx/5xx responses: 0.
- Missing image assets: 0.
- Airstrip text present: true.
- Ice text present: false.

Ice no-regression also passed across public pages, static contact health, Pumpkin API health, and Admin UI production routes.
