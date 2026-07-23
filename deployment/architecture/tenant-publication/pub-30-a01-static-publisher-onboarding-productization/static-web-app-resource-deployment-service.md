# Static Web App resource deployment service

The source implementation converts the prior manual flow into a tenant-neutral service with an injected platform adapter. Its contract supports plan/create/reuse, tag/read, origin registration, exact-artifact deploy, hostname/noindex verification, update, rollback, publication revoke, custom-domain read state, and domain-handoff generation.

Guardrails:

- only the Azure Static Web Apps `Free` SKU is accepted;
- every operation carries an approval reference and tenant/publication identity;
- artifact and manifest hashes are validated before deployment;
- custom-domain work is read/handoff-only and remains `HELD`;
- archive/delete is a typed-confirmation plan, not an automatic execution path;
- indexing, token reset/rotation, paid-plan creation, and secret values are not supported;
- the built-in adapter is plan-only; tests use an in-memory injected adapter.

The retained PUB-20 resource, default hostname, noindex behavior, active A02 artifact lineage, and deterministic safe no-post rollback lineage were read at entry. PUB-30 performed zero Static Web App deployment attempts and zero deployments.

The locally accepted API and Admin archives are frozen at SHA-256 `f616e5c0025e6d1022d7423b761d0df19c3d597e962c97f3fc94ce83d55c76e5` and `1a46dcc4f6d179538761cc5368c015197a6b2869bf6469e633b966beffcc6c7e`. They were not deployed or used to consume an attempt. No starter/shared-runtime or synthetic-SWA attempt was made.

The read-only API-settings diagnostic exposed protected values in command trace, so no API/Admin/starter/SWA deployment may proceed under the current authority. Explicit `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` authority and subsequent production-parity readback are required first.
