# Pumpkin Domain Manager UI V2.8.60U

Status: implemented and deployed.

The Admin UI now has a SuperAdmin-only Domain Manager route:

- Route: `/dashboard/onboarding/domains`
- Nav label: `Domains`
- Source: `apps/admin/src/app/dashboard/onboarding/domains/page.tsx`

Capabilities:

- Lists SuperAdmin-accessible tenants.
- Shows Ice and Airstrip in the tenant list.
- Reads DomainBinding records for the selected tenant.
- Displays Airstrip `pending_dns_records`.
- Displays DNS packet records for manual provider entry.
- Runs read-only public DNS validation through the Pumpkin API.
- Displays last validation result.
- Shows future Azure hostname, TLS, promote, and rollback controls as disabled.

Not implemented in this phase:

- Bluehost DNS automation.
- Azure custom-domain binding.
- TLS binding.
- Domain promotion.
- Rollback.
- Search Console or indexing.

V2.8.60U changed the Admin UI only. Pumpkin API was not deployed.
