# Recommended Fix Plan

## Recommended Next Action

Create or use a local-only draft preview path for Ice homepage review. The preview path should read the unpublished CMS draft through an authenticated/admin-safe route or an explicitly local preview mechanism without publishing the page and without exposing secrets to the browser.

## Fix Plan

- For local review, add or use a local-only authenticated draft preview path so Ice can render the draft homepage without publishing it.
- Do not re-import the homepage just to solve this symptom; the selected rich homepage is already represented in the local draft readback artifact.
- Before any public publishing/cutover, decide how frontend media URLs resolve. A local Next rewrite from /media/:path* to the Pumpkin API media host is the narrowest development fix.
- Keep CMS Page and Theme writes paused until the user explicitly authorizes a draft preview/import/publish step.
- Keep RollerRinkRentals.com paused.

## Do Not Do Yet

- Do not publish the homepage merely to make localhost:3002/ show it.
- Do not re-import the homepage unless a new import is explicitly authorized.
- Do not update contact or service-area pages as part of this homepage diagnostic.
- Do not regenerate production static packages.
- Do not deploy.
- Do not stage raw media files, ZIPs, generated static artifacts, snapshots, dry-run folders, .next, node_modules, or protected config.

## Blockers Before Preview

- Frontend route / uses the public published page endpoint, not an admin/draft endpoint.
- Relative /media URLs 404 on localhost:3002 without a media rewrite/proxy or frontend-served local media.

## Blockers Before CMS Import

- Diagnostic run did not authorize any CMS write.
- Final human approval and any local import preflight must be explicit before another write.

## Blockers Before Production

- Homepage is not approved/published for production.
- Static regeneration and indexing remain intentionally blocked.
- Production media URL strategy and public image availability must be verified first.
