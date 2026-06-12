# Ice Canonical Route Model

Current safe repo evidence defines the Ice launch route model as:

| Route | Source evidence |
| --- | --- |
| `/` | `apps/ice-rink-web/scripts/static-publish.mjs`; `deployment/static-azure/scripts/static-publish-dry-run.mjs` |
| `/contact` | `apps/ice-rink-web/scripts/static-publish.mjs`; `deployment/static-azure/validate-static-output.mjs` |
| `/service-areas` | `apps/ice-rink-web/scripts/static-publish.mjs`; `packages/pumpkin-ts-models/src/design-system.ts` |

Obsolete routes:

| Route | Status |
| --- | --- |
| `/ice-rink-rentals` | obsolete for Ice local publish-readiness route shape |
| `/events-holiday-activations` | obsolete for Ice local publish-readiness route shape |

V2.8.2 did not change the canonical route model. It reconciled the local seed-site source to the existing canonical model.
