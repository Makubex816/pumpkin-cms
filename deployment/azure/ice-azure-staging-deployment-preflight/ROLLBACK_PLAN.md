# Rollback Plan

Generated: 2026-06-06

## Scope

Planning only. No deployment or rollback action occurred.

## Staging Rollback Strategy

If a future Azure Static Web Apps staging deployment fails:

1. Stop sharing the staging URL.
2. Record the Azure default hostname, package artifact path, commit SHA, timestamp, and failed checks.
3. Do not change production DNS.
4. Do not change Cloudflare root/www records.
5. Do not deploy the failed package to production.
6. Redeploy the previous known-good staging artifact if one exists and explicit approval or incident policy allows it.
7. If this was the first staging deployment, leave the staging resource unused or disable/delete it only with explicit approval.

## Package Rollback

Rollback artifact strategy:

- keep the previous known-good artifact path or deployment history reference
- retain the current artifact path
- rerun validators before redeploying any previous artifact
- document the artifact source and commit SHA

## Function/Form Rollback

No Function setting change occurred in this preflight.

Existing form rollback remains:

```text
FORM_DELIVERY_MODE=no-email
```

If a future staging-origin CORS change is approved and causes problems, rollback should remove the staging origin or restore the previous allowed-origin setting only with approval.

No valid email test is part of this staging preflight.

## Media Rollback

Current media URLs use `media.iceskatingrinkrentals.com`.

If media delivery fails during staging:

- verify the media URL directly
- verify Cloudflare Worker media delivery
- do not change CMS records
- do not change MediaAsset records
- do not change Cloudflare media configuration unless separately approved

## DNS Rollback

No production DNS cutover is part of staging preflight.

If a later custom staging domain is approved:

- record the before/after staging DNS record only
- rollback only the staging DNS record with approval
- keep root/apex and `www` untouched

## Production Rollback

Not applicable. No production deployment or DNS cutover is approved.
