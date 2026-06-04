# Remaining Media Risks

Generated: 2026-06-04

## Source Risks

- `.local-media` contains all 9 source candidates, but future execution should confirm whether these local cache files are approved upload sources.
- The original PPEC replacement input file is documented in older safe docs but is not currently present in the repo-visible file tree.
- Service-areas raw image variants do not hash-match the active blocker files and should not be substituted without review.

## Infrastructure Risks

- Azure Storage account and container do not exist in this preflight.
- Cloudflare media hostname is not configured in this preflight.
- Exact origin hostname and access model remain pending approval.
- Cache rules and SSL/TLS behavior remain unverified.

## MediaAsset Risks

- MediaAsset records still point at local media URLs until a future approved write.
- Exact production field names should be reconfirmed against current contracts before any update.
- A partial MediaAsset update could leave static output mixed between local and CDN URLs.

## Validation Risks

- Strict validators will continue to fail for media until production CDN URLs are live and static output is rebuilt.
- Form endpoint strict errors will remain after media is fixed.
- Azure staging and DNS cutover remain blocked until media and form readiness are resolved or an explicit staging exception is approved.

## Rollback Risks

- Old local media URLs and new checksum paths must be retained through the rollback window.
- Overwriting an existing checksum path would weaken rollback safety.
- DNS/cache propagation could delay media rollback if Cloudflare settings are changed later.

## Current Risk Result

No new production risk was introduced by this preflight because no resources, uploads, writes, DNS changes, or deployments occurred.
