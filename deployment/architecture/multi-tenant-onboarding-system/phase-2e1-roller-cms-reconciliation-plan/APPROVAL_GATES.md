# Approval Gates

## Gate 1: Reconciliation Read-Only Refresh

Approval needed to run a new CMS/API read-only refresh.

Allowed only if explicitly approved:

- GET/HEAD only;
- presence-only env checks;
- redacted evidence;
- no protected config reads;
- no writes.

## Gate 2: Content Comparison

Approval needed to compare actual CMS page content against the local package and owner-approved content expectations.

No writes.

## Gate 3: Existing Page Update Decision

Approval needed before updating `home`, `contact`, or `roller-rink-rentals`.

Must name exact page(s), expected deltas, rollback owner, and readback checks.

## Gate 4: Missing `service-areas` Creation

Approval needed before creating/importing the missing `service-areas` page.

Must explicitly approve CMS write scope and exclude live publication, deployment, DNS, email, Search Console, and indexing.

## Gate 5: Form Recipient Mapping

Approval needed before creating or updating any form-recipient registry or form delivery mapping.

Email delivery remains a separate hard stop.

## Gate 6: Sitemap/Robots Adjustment

Approval needed before changing sitemap inclusion, robots, canonical state, or SEO metadata.

Search Console/indexing remains separate and final.

## Gate 7: CMS Readback Verification

Approval needed after any future write to run readback verification.

Readback should verify IDs, routes, workflow state, sitemap, robots, forms, media references, theme, and hard stops.

## Gate 8: Static Readiness Planning

Not available until CMS reconciliation write gates and readback evidence pass.

## Gate 9: Production And Live-Page Gates

Separate future approvals required. Phase 2E-1 gives no live-page approval.
