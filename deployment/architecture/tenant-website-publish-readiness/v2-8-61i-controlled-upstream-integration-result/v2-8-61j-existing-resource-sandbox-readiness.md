# V2.8.61J Existing Resource Sandbox Readiness

Status: ready for separate approval if owner wants runtime proof.

Recommended V2.8.61J scope:

- Use only an existing non-Airstrip sandbox or local-only environment.
- Do not create new Azure resources.
- Do not deploy to Airstrip.
- Do not use Airstrip isolated preview.
- Do not mutate live appsettings, DNS, custom domains, content, media, users, roles, tenants, storage, Cosmos, or DomainBinding.
- Install starter dependencies only after explicit approval and only in `apps/starter-app`.
- Run starter type-check/build.
- If an existing non-Airstrip sandbox is approved, deploy starter app there once and prove only sandbox routes.
- Keep customer-facing form submit POST proof behind separate explicit approval.

Suggested next objective:

Prove `apps/starter-app` locally or in an existing non-Airstrip sandbox, then decide whether to keep embedded `/admin` as starter-only or adapt it into the standalone Admin UI.
