# Static Form Endpoint Blocker Audit

Generated: 2026-06-04

## Scope

This audit diagnoses the remaining static form endpoint strict validator errors.

No endpoint was deployed, no email was sent, no Microsoft 365 settings were touched, and no protected config was read.

## Current Form Sources

The approved Ice snapshot contains form blocks on:

| Page slug | Route | Source |
| --- | --- | --- |
| `home` | `/` | `formBlock` |
| `contact` | `/contact` | `formBlock` |

Static route-shape proof can render those pages, but static production readiness requires the browser form to post to a real verified endpoint.

## Expected Static Build Config

The static runtime and validators look for a public endpoint URL from these env vars, in order:

1. `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
2. `STATIC_FORM_ENDPOINT`
3. `NEXT_PUBLIC_STATIC_FORM_ACTION`
4. `STATIC_FORM_ACTION`

Verification is read from:

```text
STATIC_FORM_ENDPOINT_VERIFIED=true
```

Presence-only check in the current shell:

| Env var | Status |
| --- | --- |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` | MISSING |
| `STATIC_FORM_ENDPOINT` | MISSING |
| `NEXT_PUBLIC_STATIC_FORM_ACTION` | MISSING |
| `STATIC_FORM_ACTION` | MISSING |
| `STATIC_FORM_ENDPOINT_VERIFIED` | MISSING |

No endpoint value was printed.

## Validator Read Paths

| Validator/tool | Endpoint read path | Verification read path |
| --- | --- | --- |
| `deployment/static-azure/validate-static-output.mjs` | `getConfiguredStaticFormEndpoint()` | `STATIC_FORM_ENDPOINT_VERIFIED === 'true'` |
| `deployment/static-azure/validate-staging-package.mjs` | `getConfiguredStaticFormEndpoint()` | `STATIC_FORM_ENDPOINT_VERIFIED === 'true'` |
| `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` | `getConfiguredStaticFormEndpoint()` | `STATIC_FORM_ENDPOINT_VERIFIED === 'true'` |
| `apps/ice-rink-web/scripts/static-publish.mjs` | `getConfiguredStaticFormEndpoint()` | `STATIC_FORM_ENDPOINT_VERIFIED === 'true'` |
| `apps/ice-rink-web/src/lib/render-mode.ts` | static form endpoint resolution | public static endpoint URL only |

The frontend form handler uses the resolved static endpoint in static render mode. If no endpoint is configured, static form submission shows the static endpoint limitation instead of pretending success.

## Current Strict Errors

| Error | Cause | Correct behavior |
| --- | --- | --- |
| `Static form endpoint is not configured for production/static deploy readiness.` | no public static endpoint env var is present | fail strict production/staging validators |
| `Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.` | `STATIC_FORM_ENDPOINT_VERIFIED` is not `true` | fail strict production/staging validators |

## Local Placeholder Policy

A local placeholder or stub can be useful only for route-shape or interaction experiments, but it must not be used to mark production readiness yes.

The strict validators correctly reject:

- missing endpoint values
- localhost or `127.0.0.1`
- placeholder/example URLs
- unverified endpoint state

Passing strict staging/production validators requires a real HTTPS endpoint and explicit backend verification. That endpoint work is outside this local diagnosis pass.

## Policy Result

Contact form production readiness: no.

Static form endpoint/backend verification remains blocked until separately authorized endpoint work is completed.
