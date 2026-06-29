# Isolated UI Login Navigation Result

Target:

`https://app-pumpkin-admin-isolated-centralus-001.azurewebsites.net`

Result:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- Browser login succeeded.
- Dashboard loaded.
- Pages route loaded.
- Tenant text was visible.
- Role: `TenantAdmin`.
- Tenant matched `ice-rink-rentals`.
- Live Pumpkin API requests were observed.
- Localhost API requests observed: 0.

Classification:

`isolated_admin_ui_login_navigation_tenant_context_proven`
