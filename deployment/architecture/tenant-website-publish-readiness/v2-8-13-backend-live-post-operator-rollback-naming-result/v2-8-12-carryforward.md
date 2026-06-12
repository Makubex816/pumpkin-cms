# V2.8.12 Carryforward

V2.8.12 prepared the backend verification packet but did not send a POST.

Carried forward values:

| Field | Value |
| --- | --- |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Static Web App | `swa-ice-static-staging` |
| Static Web App RG | `rg-ice-static-staging` |
| Default host | `happy-mud-0b375e20f.7.azurestaticapps.net` |
| Expected dry-run response | `200` JSON with `ok: true` |

V2.8.13 used the approved prompt value `PumpkinCMS operator` to close the role-based operator and rollback owner records for the backend verification and future staging-publish readiness path.

