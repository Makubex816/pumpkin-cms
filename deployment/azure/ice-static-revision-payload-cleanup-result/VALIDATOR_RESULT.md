# Validator Result

Validators were rerun after the public static revision payload cleanup.

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | pass with non-media production-readiness warnings |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | 1 | fail only on static form endpoint readiness |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | 1 | fail only on static form endpoint readiness |

Snapshot validator warnings:

- contact/home static form endpoint is not configured
- contact/home static form endpoint/backend verification is missing
- `staticPublishing.needsRebuild` remains true
- fulfillment readiness warnings remain
- service-area non-direct fulfillment disclosure warning remains

Strict static/staging remaining errors:

- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing; mailbox readiness is not app form readiness

Cleared validator category:

- local-dev media URL errors in `index.html`, `index.txt`, `contact/index.html`, `contact/index.txt`, `service-areas/index.html`, and `service-areas/index.txt`

