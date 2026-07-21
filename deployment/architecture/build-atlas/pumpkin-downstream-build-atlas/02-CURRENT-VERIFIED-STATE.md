# Current Verified State — July 15, 2026

## Repository observations

| Item | Observed state | Interpretation |
|---|---|---|
| Upstream `SDI-AI/pumpkin-cms/main` | `18b5cea01d23298b95b5945999e66a4aec8d748b` — merge of starter visual page editor | New intake candidate is visible. It is not yet frozen or qualified. |
| Previous observed upstream | `785e079269276c177832f9e7186ae44675e76f52` | New head is five commits ahead. |
| Upstream delta | 5 commits, 43 changed paths | CAPTCHA, visual editing, block identity, navigation, header logo, tests, and ignore rules. |
| Public downstream `Makubex816/pumpkin-cms/main` | `64156a3015943f08bc89cadb2caae910d5cadf4f` — `SiteMap` | Public main is zero ahead and 59 behind upstream. |
| Public merge base | `64156a3015943f08bc89cadb2caae910d5cadf4f` | Public branch is already upstream ancestry and can only prove historical lineage. |
| Active downstream product | Not visible in the two public default branches | Must be provided by the current build closeout and local/private inventory. |
| Upstream CI/status evidence | No combined statuses or PR workflow runs observed for the new head | Clean-room qualification remains mandatory. |
| Authorize.Net | No code observed in the new public head | Still gated pending a later partner push. |

## Upstream CAPTCHA foundation observed

- tenant defaults under `TenantSettings.FormSecurity.Captcha`;
- provider, public site key, secret configuration reference, default-enabled flag, and allowed hostnames;
- per-form `inherit`, `required`, and `disabled` modes plus action;
- server-side Turnstile Siteverify call;
- action and hostname checks;
- public FormDefinition resolution without returning the secret;
- client widgets for Contact and generic Form blocks;
- tests proving one verifier call, no token persistence, and no save on missing token;
- relative/HTTP(S) redirect validation.

Status: `observed_unqualified`, decision `adopt_and_harden`.

## Upstream visual editor foundation observed

- persistent block `id`, `name`, and `enabled` model fields;
- JSON round-trip test for those fields;
- authenticated interactive preview route;
- same-origin editor/preview messaging;
- insert, select, edit, move, duplicate, and delete block controls;
- responsive preview widths;
- full page metadata, SEO, relationships, and structured-data editing;
- visual navigation tree editing;
- header logo selection from media;
- unsaved-change detection;
- page and theme save routes with revalidation attempts.

Status: `observed_unqualified`, decision `adapt_or_port`.

## Material gaps still open

### CAPTCHA and form reliability

- provider verification does not send a Siteverify idempotency key;
- clients reset the widget on success but not on every failed/spent-token path;
- provider/network failure telemetry and structured error-code capture are not proven;
- current rate limiting remains process-local rather than distributed;
- submission IDs, correlation IDs, exact-one idempotency, and ambiguous-timeout recovery remain unproven;
- universal tenant rollout and live isolation proof remain unproven;
- CSP, accessibility, outage policy, replay, expiry, action-mismatch, hostname-mismatch, and concurrency tests remain acceptance gates.

### Visual editor

- no attached CI/workflow proof;
- only a narrow block round-trip test is visible;
- existing-page block-ID migration and all-block fixture coverage are not proven;
- optimistic concurrency/version conflict behavior is not proven;
- preview isolation requires threat review; form/link capture is not a complete sandbox boundary;
- cache revalidation result is not always read back;
- downstream TenantAdmin/SuperAdmin role behavior and cross-tenant isolation are not yet mapped;
- deployed tenant compatibility and rollback are not proven.

## Current live build protection

The active build phase remains authoritative for current product truth. Its closeout must include source commits, deployment IDs, preflight results, submission/correlation IDs, FormEntry readback, final form modes, Atlas location/version, and exact blockers. No upstream integration is approved before that evidence is ingested.

## Current status summary

```text
upstreamSource: observed_unqualified
captchaFoundation: observed_unqualified / adopt_and_harden
visualEditorFoundation: observed_unqualified / adapt_or_port
publicDownstreamHistory: observed_historical_lineage
activeDownstreamBuild: closeout_required
liveAtlas: inventory_required
authorizeNet: blocked_external
currentBuildMutationBudgetFromThisPackage: zero
```
