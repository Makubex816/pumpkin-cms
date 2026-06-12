# Local Build / Preview Validation Result

| Command | Result | Notes |
| --- | --- | --- |
| `npm run validate:static:ice` | failed as expected | Current safe Ice seed-site source is stale. |
| `npm run validate:static:roller` | passed with 31 warnings | Roller remains paused. |
| `npm run type-check` | passed | No TypeScript failure in tenant website app. |
| `npm run build:static:ice` | passed with warnings and protected-config caveat | Next completed static build but auto-detected `.env.local`; no values were opened or printed. |
| `node ../../deployment/static-azure/validate-static-output.mjs --site ice-rink-rentals --out out` | failed as expected | Output is not publish-ready. |

Static output validator errors included:

- missing `service-areas/index.html`
- obsolete `ice-rink-rentals/index.html`
- obsolete `events-holiday-activations/index.html`
- static form endpoint not configured/verified in current shell
- raw draft-preview output includes noindex/local media references

Because the clean static seed validation failed, no publish dry-run, deployment package, dev server, public preview, external crawl, or live route check was run.
