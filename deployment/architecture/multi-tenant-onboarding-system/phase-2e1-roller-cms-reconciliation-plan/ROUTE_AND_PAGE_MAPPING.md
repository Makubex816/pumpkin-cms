# Route And Page Mapping

## Expected Vs Existing

| Expected package item | Existing CMS evidence | Recommendation |
| --- | --- | --- |
| Tenant `roller-rink-rentals` | active tenant exists | preserve/adopt existing tenant shell if owner confirms it is intended |
| Site/domain `rollerrinkrentals.com` | domain mention on target tenant/page evidence | preserve/adopt after read-only refresh confirms no global conflict |
| Home route `/` / slug `home` | exists, published, sitemap-included | adopt existing page if content matches; update only under later write approval |
| Contact route `/contact/` / slug `contact` | exists, published, sitemap-included | adopt existing page if content/form mapping matches; update only under later write approval |
| Service areas route `/service-areas/` / slug `service-areas` | missing, HTTP 404 | create/import only after explicit CMS write approval |
| Additional route `/roller-rink-rentals/` | exists, published, sitemap-included | preserve until owner decides purpose; possible later redirect/update/no-op |
| Draft test route | draft, not sitemap-included | preserve/no-op in reconciliation; cleanup requires separate approval |
| Forbidden routes `/preview/`, `/draft/`, `/old-roller-rink-rentals/`, `/old/` | no direct records for sampled forbidden slugs | keep blocked; refresh before any write |

## Import Implication

No future import should overwrite `home` or `contact` by slug alone. Existing page IDs, workflow state, sitemap state, and owner-approved content comparison must be captured first.
