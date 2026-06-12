# V2.8.11 Carryforward

V2.8.11 resolved these safe values:

| Field | Value |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Function App RG | `rg-ice-static-form-endpoint` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Static Web App | `swa-ice-static-staging` |
| Static Web App RG | `rg-ice-static-staging` |
| Static Web App default hostname | `happy-mud-0b375e20f.7.azurestaticapps.net` |

V2.8.11 did not POST, submit a payload, deploy, change DNS, index, or publish. Backend verification remained blocked because `OPTIONS`, `HEAD`, and `GET` cannot prove POST behavior or owner workflow delivery.

