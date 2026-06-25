# V2.8.19F Carryforward

Result: carried forward.

Reviewed root report:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19F_EXISTING_AZURE_MEDIA_SOURCE_INTEGRATION_REPORT.md`

Reviewed package evidence:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-19f-existing-azure-media-source-integration-result/result-manifest.json`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19f-existing-azure-media-source-integration-result/image-reference-validation-result.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19f-existing-azure-media-source-integration-result/route-content-manifest-validation-result.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19f-existing-azure-media-source-integration-result/public-contact-email-source-update.md`

Carryforward facts:

- Recovered routes: `/`, `/service-areas`, `/contact`
- Canonical public contact email: `contact@iceskatingrinkrentals.com`
- Azure media storage account: `iceskatingmedia`
- Container: `ice-rink-rentals-media`
- Existing media base URL: `https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media`
- Existing blob prefix: `ice-rink-rentals/assets/`
- Expected existing Azure media URLs in source map: 9
- No Azure media upload was required.
- No V2.8.19F deployment occurred.

V2.8.19G note:

The first sanitized static artifact after V2.8.19F still rendered older seed JSON because static mode preferred seed-site files whenever present. V2.8.19G fixed `apps/ice-rink-web/src/lib/content-source.ts` so the approved Ice seed-site static build path renders the recovered page builders for the three approved routes.
