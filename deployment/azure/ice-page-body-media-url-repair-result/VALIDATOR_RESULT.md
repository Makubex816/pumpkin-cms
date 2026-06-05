# Validator Result

Validators were rerun after the active page body/media URL repair.

| Validator | Exit | Result |
| --- | ---: | --- |
| `npm run validate:snapshot:ice` | 0 | pass with production-readiness warnings |
| `node deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out apps/ice-rink-web/out` | 1 | fail |
| `node deployment/static-azure/validate-staging-package.mjs --site ice-rink-rentals --folder apps/ice-rink-web/out` | 1 | fail |

Original strict static/staging errors after the active page body/media repair:

- local-dev media URL found in `contact/index.html`
- local-dev media URL found in `contact/index.txt`
- local-dev media URL found in `index.html`
- local-dev media URL found in `index.txt`
- local-dev media URL found in `service-areas/index.html`
- local-dev media URL found in `service-areas/index.txt`
- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing

The local media strings remaining in those six files match the `revision.latestSnapshot` counts:

| Route | Local serialized occurrences per HTML/TXT file | Active root local URLs | Revision snapshot local URLs |
| --- | ---: | ---: | ---: |
| `/` | 52 | 0 | 52 |
| `/contact` | 50 | 0 | 50 |
| `/service-areas` | 30 | 0 | 30 |

Rendered `<img>` tags no longer used local `/media` URLs. The strict validators failed because they scan all static output text, including serialized page/revision payloads.

## Follow-Up Revision Payload Cleanup

A later approved Ice static revision-payload cleanup on 2026-06-05 removed `revision.latestSnapshot` from public static snapshot artifacts.

Current strict static/staging remaining errors:

- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing

Current local media strict errors: 0.
