# Pumpkin Ice Static Form Production Enablement Result Report

Generated: 2026-06-06

## Scope

Approved action: Ice static form production enablement.

Completed within scope:

- set `FORM_DELIVERY_MODE=graph` on `func-ice-static-contact-20260605`
- set `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` on the Function App to the approved public endpoint URL
- set `STATIC_FORM_ENDPOINT_VERIFIED=true` on the Function App after verification
- reran Ice static export/generation commands with the approved endpoint URL and verified flag in the local validation shell
- reran strict static output and staging package validators
- documented the result

Not performed: no new valid email test payload, no endpoint redeploy, no Azure resource creation, no Microsoft 365 changes, no CMS writes, no MediaAsset writes, no Cloudflare changes, no static deployment, no production website deployment, no root/www DNS changes, and Roller remains paused.

Secret values, tokens, connection strings, and protected config contents were not printed.

## Human Inbox Confirmation

Accepted.

The user confirmed the Graph test email was received in `contact@iceskatingrinkrentals.com`, the content looked safe and sanitized, and no duplicate unexpected messages appeared.

## Endpoint And Settings Result

Approved endpoint URL:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

Function App settings were updated by name only:

| Setting | Result |
| --- | --- |
| `FORM_DELIVERY_MODE` | `graph` |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` | approved endpoint URL |
| `STATIC_FORM_ENDPOINT_VERIFIED` | `true` |

Readback confirmed these categories without printing secret values:

| Check | Result |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| delivery mode | `graph` |
| approved static endpoint present | yes |
| approved static endpoint matches | yes |
| endpoint verified flag | `true` |
| Graph tenant/client/secret settings present | yes |
| Graph sender setting present | yes |
| Ice lead recipient setting present | yes |

## Verification Basis

Production enablement was based on:

- prior live Graph endpoint response: `200`, `ok=true`, entry id present
- Exchange trace status: `Delivered`
- MessageTraceId: `94e8d3f8-748a-4a5e-2fb0-08dec376c3b7`
- user human inbox confirmation
- safe invalid-only public endpoint checks before enablement, with no valid payloads attempted

No additional valid payload was submitted during this enablement turn.

## Static Export Result

The official CMS-backed export command was rerun with the approved endpoint env values:

```text
npm run export:static:ice:cms
```

Result:

```text
failed at snapshot:cms:ice with 401 Unauthorized from admin pages
```

No CMS write was attempted or performed.

Because the fresh CMS snapshot step was blocked by admin authentication, the local static output was regenerated from the existing Ice CMS snapshot:

| Command | Result |
| --- | --- |
| `npm run validate:snapshot:ice` | passed |
| `npm run build:static:ice:cms` | passed with existing build warnings |
| `node scripts/static-publish.mjs generate` | passed |

Generation summary:

| Metric | Result |
| --- | --- |
| site | `ice-rink-rentals` |
| published pages | `3` |
| redirects | `0` |
| output snapshot | yes |
| static artifact directory | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals` |

Known generation warnings remained content/build hygiene warnings, not form endpoint errors:

- `staticPublishing.needsRebuild is true` on snapshot pages
- missing fulfillment status on `contact` and `home`
- non-direct fulfillment public disclosure warning on `service-areas`
- excluded preview output paths were removed
- existing Next build warnings for hook dependencies, image usage, custom export routes, and an `fs` import trace

## Strict Validator Result

Both strict validators passed against the locally generated output with:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

| Validator | Result |
| --- | --- |
| `deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | passed, 42 files, 0 errors, 0 warnings |
| `deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | passed, 42 files, 0 errors, 0 warnings |

## Readiness Classification

| Gate | Status |
| --- | --- |
| Graph live email proof | yes |
| human inbox confirmation | yes |
| Function production delivery mode | enabled: `graph` |
| validator endpoint URL configured | yes |
| validator verified flag configured | yes |
| strict static output validator | passed |
| strict staging package validator | passed |
| contact form production readiness for the approved endpoint/config | yes |
| fresh CMS-backed export | blocked by admin `401 Unauthorized` |
| production website deployment | not performed |
| root/www DNS cutover readiness | not changed |
| Roller | paused |

The contact form endpoint is production-enabled in Azure. The public website was not deployed, so public-site production behavior will not change until a separately approved static deployment uses the validated endpoint configuration.

## Rollback

If production email delivery must be disabled, use the existing rollback:

```text
FORM_DELIVERY_MODE=no-email
```

For validator or staging contexts that should no longer treat the endpoint as production verified, unset `STATIC_FORM_ENDPOINT_VERIFIED` or set it to a non-true value in that context.

Do not rotate secrets, change Microsoft 365, change CMS content, or deploy the static site as part of rollback unless separately approved.

## Remaining Blockers

- Fresh CMS-backed static export needs valid admin snapshot authentication before it can complete end to end.
- No production static deployment was performed in this approval.
- No Cloudflare/root/www DNS changes were performed.

## Evidence Package

See:

```text
deployment/azure/ice-static-form-production-enablement-result/
```

