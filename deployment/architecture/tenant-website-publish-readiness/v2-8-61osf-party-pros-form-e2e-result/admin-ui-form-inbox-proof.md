# Admin UI Form Inbox Proof

Live Admin UI route checks:

- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/` returned `200`.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/login` returned `200`.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard/forms` returned `200`.
- `https://app-pumpkin-admin-prod-centralus-001.azurewebsites.net/dashboard/forms/43dcad71-0f9c-47b2-97db-69374ee9560f?tenantId=party-pros-philadelphia` returned `200`.

Source support:

- Lead Inbox page calls `apiClient.getFormEntries(token, currentTenant.tenantId)`.
- Lead detail page calls `apiClient.getFormEntry(token, routeTenantId, id)`.
- Lead detail page blocks loading when the route tenant does not match the current tenant context.
- API client routes match the authenticated Admin API readback paths used in OSF.

The authenticated Admin API readback proved the entry is present and tenant-scoped. Browser automation was not added because Playwright is not installed in this workspace.

