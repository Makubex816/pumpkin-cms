# Current State Summary

The Pumpkin API now has the V2.8.61OSD submit-key provisioning source deployed.

Readiness probe:

| Probe | Result |
| --- | --- |
| `POST /api/admin/tenants/party-pros-philadelphia/submit-key` without auth and without secret body | HTTP `401` |
| Route live classification | `live_auth_gated` |

OSE stopped here by design. Party Pros submit-key registration and form E2E remain held for the next approved phase.

