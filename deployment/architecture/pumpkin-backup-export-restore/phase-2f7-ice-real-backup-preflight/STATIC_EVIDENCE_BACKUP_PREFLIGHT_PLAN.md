# Static Evidence Backup Preflight Plan

## Future Static Evidence Scope

The future Ice standard backup should include safe static/public evidence from the approved backup execution window:

- route proof for `/`, `/contact`, and `/service-areas`;
- obsolete-route 404 proof for `/ice-rink-rentals` and `/events-holiday-activations`;
- sitemap snapshot;
- robots.txt snapshot;
- canonical URL snapshot;
- noindex/indexing evidence;
- form endpoint proof without valid form submission;
- media URL proof;
- static output validator result;
- staging package validator result;
- production readiness reports.

## Static Output Evidence Sources

Known prior evidence includes:

- 3 approved deployable routes;
- strict static output validator pass;
- strict staging package validator pass;
- sitemap and canonical alignment;
- robots permits indexing;
- Search Console/indexing hard stop still pending final owner approval.

## Future Execution Rules

- Static evidence may be captured only after explicit backup execution approval.
- Safe `HEAD`/`GET` checks may be used only if approved in the future execution prompt.
- No valid contact form payload should be submitted during static evidence capture.
- Static artifact directories must not be staged into git.
- Static evidence must not trigger deployment or regeneration unless separately approved.

## Phase 2F-7 Boundary

No external checks, static export, static generation, deployment, sitemap submission, Search Console action, or indexing action occurs in this phase.
