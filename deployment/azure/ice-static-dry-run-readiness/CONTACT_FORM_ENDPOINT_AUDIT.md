# Contact Form Endpoint Audit

## Current Snapshot And Output

The current snapshot contains form blocks:

- `home`: `formBlock`
- `contact`: `formBlock`

The generated static output was produced for route-shape proof, but the strict production/staging validators still reject the output because a static contact form endpoint is missing or unverified.

No endpoint value was printed.

Current shell presence-only check:

| Env var | Status |
| --- | --- |
| `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` | MISSING |
| `STATIC_FORM_ENDPOINT` | MISSING |
| `NEXT_PUBLIC_STATIC_FORM_ACTION` | MISSING |
| `STATIC_FORM_ACTION` | MISSING |
| `STATIC_FORM_ENDPOINT_VERIFIED` | MISSING |

Strict validator errors:

- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing; mailbox readiness is not app form readiness

The validators read endpoint config from `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`, `STATIC_FORM_ENDPOINT`, `NEXT_PUBLIC_STATIC_FORM_ACTION`, or `STATIC_FORM_ACTION`. Backend verification requires `STATIC_FORM_ENDPOINT_VERIFIED=true`.

Detailed endpoint diagnosis is recorded in:

```text
deployment/azure/ice-static-dry-run-readiness/STATIC_FORM_ENDPOINT_BLOCKER_AUDIT.md
```

## Policy Result

The missing/unverified static form endpoint does not block local route-shape proof. It does block contact form production readiness, Azure staging readiness, and production deployment readiness.

## Readiness

Contact form production readiness: no.

No endpoint was deployed, no email was sent, and Microsoft 365 settings were not touched.
