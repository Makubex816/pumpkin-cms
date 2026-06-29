# Sitemap Read Result

Route:

`GET /api/tenant/ice-rink-rentals/sitemap`

Auth:

Tenant API key from the approved hard-copy, read in memory only.

Result:

- Status: HTTP 200.
- Entry count: 0.
- Proof slug present: false.
- Expected exclusion because `includeInSitemap=false`: true.

Classification:

`sitemap_exclusion_proof_succeeded`
