# Ice Local Publish-Readiness Evidence Index

| Evidence | Path or command | Result |
| --- | --- | --- |
| V2.8.1 preflight | `deployment/architecture/tenant-website-publish-readiness/v2-8-1-local-preflight-result/` | historical blocker baseline |
| V2.8.2 repair | `deployment/architecture/tenant-website-publish-readiness/v2-8-2-ice-static-source-route-repair-result/` | complete repair |
| Seed validation | `npm run validate` in `tools/ice-rink-local-seed` | passed |
| Ice static validation | `npm run validate:static:ice` | passed, 34 warnings |
| Roller paused safety validation | `npm run validate:static:roller` | passed, 31 warnings |
| Type-check | `npm run type-check` in `apps/ice-rink-web` | passed |
| Static build | `npm run build:static:ice` | passed with `.env.local` auto-detection caveat |
| Static generation | `node scripts/static-publish.mjs generate` with static env | passed, 35 warnings |
| Static output validator | `validate-static-output.mjs` | passed, 42 files |
| Staging package validator | `validate-staging-package.mjs` | passed, 42 files |
| Runtime QA | `.tmp/v2-8-3-runtime-qa-publish-readiness-evidence` | passed, ignored |
| Resource Registry | `.tmp/v2-8-3-operational-bindings` | passed, ignored |
| OLM provider profile | `.tmp/v2-8-3-provider-profile-check` | passed, ignored |
| Static manifest | `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/static-publish-manifest.json` | generated, ignored |

Generated `.tmp`, `.next`, `out`, and `.static-artifacts` evidence remains ignored and must not be staged.

