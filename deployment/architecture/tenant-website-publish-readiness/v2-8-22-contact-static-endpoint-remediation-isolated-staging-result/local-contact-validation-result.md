# Local Contact Validation Result

Local checks run:

| Check | Result |
| --- | --- |
| Static form endpoint syntax, `npm run check` | pass |
| Static form endpoint tests, `npm test` | pass |
| Ice web type-check, `npm run type-check` | pass |
| Ice static validation, `npm run validate:static:ice` | pass with 34 existing warnings |
| Sanitized Ice static build | pass |

New function tests added:

- Direct handler accepts isolated staging origin.
- Azure Functions adapter accepts isolated staging origin in no-email dry-run mode.

No protected config was read. The sanitized build reported `protectedConfigCopied: false` and `protectedConfigContentsRead: false`.
