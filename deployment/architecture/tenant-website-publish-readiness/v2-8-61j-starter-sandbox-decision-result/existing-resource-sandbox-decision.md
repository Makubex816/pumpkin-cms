# Existing Resource Sandbox Decision

Status: decision packet complete.

Decision for V2.8.61J: local-only proof is safest now.

No existing Azure resource was selected for automatic starter deployment.

Candidate resources for a future separate approval:

| Candidate | Classification | Fit | Risk |
| --- | --- | --- | --- |
| `app-pumpkin-admin-isolated-centralus-001` in `rg-pumpkin-api-prod-centralus` | existing non-Airstrip isolated Admin UI proof App Service | best fit for full Next server proof | would temporarily replace isolated Admin UI proof surface; requires explicit approval and rollback |
| `swa-ice-static-isolated-staging` in `rg-ice-static-staging` | existing non-Airstrip isolated SWA proof resource | possible only for static/SWA-adapted starter output | currently tied to Ice isolated staging and may not support full Next server/API routes without adaptation |

Rejected:

- production resources;
- Airstrip resources;
- resources with public production custom domains;
- legacy static-contact function resources.

Recommendation:

- continue local-only for immediate starter proof;
- if Azure proof is required, prefer `app-pumpkin-admin-isolated-centralus-001` only under a separate approval that backs up the existing isolated Admin UI package and defines rollback.
