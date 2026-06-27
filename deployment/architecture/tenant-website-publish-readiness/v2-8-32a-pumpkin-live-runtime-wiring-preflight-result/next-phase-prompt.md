# Next Phase Prompt

Use this as the next approval prompt.

```text
V2.8.32B Pumpkin API Live Resource Discovery And Exposure Preflight

Read and carry forward:
- PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32A_PUMPKIN_LIVE_RUNTIME_WIRING_PREFLIGHT_REPORT.md
- deployment/architecture/tenant-website-publish-readiness/v2-8-32a-pumpkin-live-runtime-wiring-preflight-result/

Goal:
Determine the canonical live Pumpkin API runtime target for Ice contact persistence and Admin form-entry reads. If no live runtime exists, produce the exact safe API exposure/deployment plan and rollback plan, but do not deploy without a separate approval.

Allowed:
- Repo-local source and documentation inspection.
- Azure metadata-only inventory for App Service, Function App, Container App, Static Web Apps managed API resources, resource groups, Cosmos account/database/container metadata, identities, plans, and hostnames.
- Non-secret runtime target classification.
- Reading prior V2.8.26 through V2.8.32A reports.

Forbidden:
- No deployment, redeployment, publish, or static app deployment.
- No production contact POST or API write.
- No production API health call unless separately approved after the target is identified.
- No Azure mutation.
- No Azure app setting list/show/set.
- No protected config reads including .env.local, appsettings*.json, local.settings*.json, Key Vault secrets, account keys, connection strings, SAS values, deployment tokens, or publish profile contents.
- No DNS/custom-domain mutation.

Required outputs:
- Root report for V2.8.32B.
- Result package under deployment/architecture/tenant-website-publish-readiness/.
- Canonical API runtime target decision: existing verified resource, alternate host type, or missing resource.
- Provider-binding preflight for production Cosmos without secrets.
- Admin/static contact binding impact map.
- Deployment and rollback plan if a new API host is required.
- Validation summary and exact next approval prompt.
```
