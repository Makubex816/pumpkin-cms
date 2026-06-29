# Admin UI Live Status Result

Final Admin UI status:

`admin_ui_live_on_production_default_host_readonly_api_proven`

Hosts:

- Isolated: `https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`.
- Production: `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net`.

Both hosts returned HTTP 200 for `/` and `/login`, and sampled static assets returned HTTP 200.

The Admin API login/read-only proof passed against the live Pumpkin API. The Admin UI shell is deployable and live; tenant content is not seeded yet.
