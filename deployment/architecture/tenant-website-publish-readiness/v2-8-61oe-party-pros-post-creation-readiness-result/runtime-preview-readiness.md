# Runtime Preview Readiness

Party Pros is not public-preview ready yet because all pages are unpublished and no preview/deploy/DNS/POST scope is approved.

Current readiness:

- Tenant exists.
- TenantAdmin exists and scope was reproved.
- Media blobs and MediaAsset records are present.
- Theme, FormDefinition, and three pages are present.
- Pages are unpublished and excluded from sitemap.

Current source constraints:

- Admin publishing profiles currently include `ice-rink-rentals` and `roller-rink-rentals`; Party Pros has no publish command profile yet.
- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` currently recognizes Ice and Roller site definitions, not Party Pros.
- `apps/starter-app` can be configured by tenant through `PUMPKIN_TENANT_ID`, `PUMPKIN_API_URL`, and `PUMPKIN_API_KEY`, but starter-app production use requires a separate isolated proof phase.

Next preview work should be scoped as planning/proof only unless the owner separately approves page publish, static snapshot, deploy, domain, and form-submission actions.

