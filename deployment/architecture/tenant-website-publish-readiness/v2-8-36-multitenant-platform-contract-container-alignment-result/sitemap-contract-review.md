# Sitemap Contract Review

Source route:

- `GET /api/tenant/{tenantId}/sitemap`

Tenant/auth behavior:

- The route extracts bearer API key auth.
- Tenant API key validation is performed against the route tenant.
- Source queries `Page` by `tenantId`, `isPublished=true`, and `includeInSitemap=true`.

Readiness:

- Source contract is present.
- `Page` container now exists with `/tenantId`.
- Public sitemap live proof was skipped because no parseable API key was available from the approved hard-copy.
