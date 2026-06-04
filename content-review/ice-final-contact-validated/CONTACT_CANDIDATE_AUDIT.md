# Contact Candidate Audit

Selected candidate:

`content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.full.json`

Reason:

The full Phase 9E contact package has the correct tenant/site, /contact route, content blocks, form routing, SEO, media manifest, and draft workflow metadata. Content-only, forms-routing, media-manifest, schema, preview HTML, and assets are supporting/reference files.

Rejected/supporting files:

- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.content.json - Partial content-only file; useful as source content but not a full Page candidate.
- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.forms-routing.json - Form/routing reference only; not a Page candidate.
- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.media-manifest.json - Media manifest only; not a Page candidate.
- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.schema.json - Schema/SEO reference only; not a Page candidate.
- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/contact/ice-contact-page.phase9e.visual-pumpkin-rewrite.preview.html - Preview HTML is reference only and is not used as runtime CMS content.
- content-review/ice-final-contact-input/extracted/ice-contact-page-phase9e-visual-pumpkin-rewrite/shared/ice-rink-rentals.contact-form-block.phase9e.json - Shared form reference only; normalized candidate uses Pumpkin formBlock/default-quote-request.

Normalized candidate:

`content-review/ice-final-contact-validated/CONTACT_NORMALIZED_CANDIDATE.json`

Normalization summary:

- tenantId/siteKey: `ice-rink-rentals`
- route/path: `/contact`
- slug/pageSlug: `contact`
- canonical: `https://iceskatingrinkrentals.com/contact`
- workflow: draft / needs_review
- productionApproved: false
- publishApproved: false
- staticPublishing.needsRebuild: true
- visible formBlock: yes
- formKey: `default-quote-request`
- sourcePage: `/contact`
- no CMS write: yes
