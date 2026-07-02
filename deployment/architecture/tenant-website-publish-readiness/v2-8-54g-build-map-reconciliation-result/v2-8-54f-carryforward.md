# V2.8.54F Carryforward

V2.8.54F closed as `validation_passed_resource_rationalization_no_mutation`.

Carryforward points:

- Production do-not-delete: Pumpkin API, Admin UI, production SWA, Cosmos, media storage, and API plan.
- Isolated/staging do-not-delete: isolated Admin UI and isolated SWA.
- Observability/backup do-not-delete: Log Analytics, action group, and six alerts.
- Legacy/deferred do-not-delete-yet: legacy static form Function, its plan, and storage until dependency proof.
- Redundant candidates: seven OLM staging resources in `rg-pumpkincms-stg-eastus-olm`, dependency proof required.
- Runtime no-regression: 14/14 effective GET checks after bounded recheck.
- Boundary: no live mutation, deploy, DNS/indexing, key/SAS, appsetting mutation, or tenant creation.

