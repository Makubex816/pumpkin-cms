# Current State Summary

Party Pros exists as a live Pumpkin tenant, but the shared starter host is not yet a Party Pros preview surface.

| Area | State |
| --- | --- |
| Latest committed carryforward | V2.8.61OH commit `f1d92953` |
| Party Pros committed baseline | V2.8.61OF commit `9bcfc8e8` |
| Owner exception | Initial continue despite no OH git commit; final readback found OH committed |
| Starter live host | `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| Starter App Service | `app-pumpkin-starter-preview-centralus-001` |
| Starter state | Running |
| Starter tenant binding | Not configured |
| Party Pros tenant | `party-pros-philadelphia`, active |
| Party Pros pages | `home`, `contact`, `service-areas` |
| Party Pros publish state | All pages unpublished |
| Party Pros media blobs | 627 carried forward |
| Party Pros MediaAsset records | 627 carried forward |
| Party Pros FormDefinition | `party-pros-quote-request` |
| Party Pros theme | `party-pros-orange-slate-v1` |

The starter appsetting name readback showed `NEXT_PUBLIC_PUMPKIN_API_URL`, `PUMPKIN_API_URL`, `PUMPKIN_SITE_NAME`, `NEXT_TELEMETRY_DISABLED`, `PORT`, and `WEBSITES_PORT`. It did not show `PUMPKIN_TENANT_ID` or `PUMPKIN_API_KEY`, so the shared host remains unbound to Party Pros.

No OI live mutation was performed.
