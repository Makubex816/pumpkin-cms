# New Public Website Publishing Gates

Required gates for all future public website changes:

1. Target classification by custom-domain attachment, not resource name.
2. Asset inventory proving source exists, output exists, HTML references asset, isolated staging serves asset, no path/case mismatch exists, and alt text is present.
3. Route/content manifest for `/`, `/service-areas`, and `/contact` with titles, H1s, sections, images, CTAs, form behavior, and SEO metadata.
4. Owner visual/content approval for homepage, service areas, contact, quote path, header/nav, footer, mobile, images, copy, CTAs, and form behavior.
5. Isolated staging first: public website changes must go to `swa-ice-static-isolated-staging` before any production-bound deploy.
6. Production-bound deploy approval naming target SWA, resource group, attached domains, artifact path, commit SHA, rollback plan, and post-deploy QA routes.
7. Hard stop if the owner describes the site as not content-complete, image-complete, customer-facing, or visually approved.

These gates supersede any assumption that a technically passing static artifact is owner-ready.

