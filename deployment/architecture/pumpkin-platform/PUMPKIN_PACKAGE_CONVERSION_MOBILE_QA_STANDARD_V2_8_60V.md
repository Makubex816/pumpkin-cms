# Pumpkin Package Conversion Mobile QA Standard V2.8.60V

Status: active for package conversion output checks.

## Conversion Rule

Imported partner packages do not have to arrive perfect. The converted Pumpkin public output must pass responsive proof before isolated publish proof, production default-host proof, or custom-domain cutover.

## Required Conversion Outputs

- `validation/expected-routes.json` for public route reachability.
- `validation/responsive-routes.json` for mobile proof route and viewport coverage.
- Responsive proof JSON from `check-responsive-output.mjs`.
- Human-readable phase report summarizing route count, viewport count, overflow failures, console errors, failed requests, bad responses, and missing images.

## Review Steps

1. Validate the normalized package with `validate-tenant-package.mjs`.
2. Confirm `responsiveReadinessRequired` is `true` for new or updated packages.
3. Confirm `validation/responsive-routes.json` includes the required V2.8.60V viewport matrix.
4. Run local responsive proof after conversion output exists.
5. Run isolated responsive proof before any production default-host deployment approval.
6. Run production default-host responsive proof before any custom-domain or DNS approval.
7. Stop if any route has horizontal overflow, failed navigation, missing images, unexpected failed requests, or unexpected console errors.

## Common Failure Patterns

- Desktop navigation remains visible on mobile instead of collapsing.
- Fixed-width rows, grids, cards, or info panels exceed viewport width.
- Active CSS omits responsive rules present in an original static artifact.
- Long CTA text or nowrap labels force horizontal scrolling.
- Media elements lack `max-width: 100%`.
- Forms use fixed columns without mobile stacking.

## Non-Goals

This QA standard does not approve live writes. It only defines the mobile proof gate that must be satisfied before a later phase asks for creation, deploy, DNS, indexing, or content mutation approval.
