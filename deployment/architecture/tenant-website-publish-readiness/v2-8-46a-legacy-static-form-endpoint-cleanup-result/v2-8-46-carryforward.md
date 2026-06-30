# V2.8.46 Carryforward

V2.8.46 deleted only two proven-empty fallback groups:

- `rg-pumpkin-api-prod-eastus`
- `rg-pumpkin-api-prod-eastus2`

V2.8.46 deferred `rg-ice-static-form-endpoint` because it was non-empty. Current known resources carried into V2.8.46A:

- Function App: `func-ice-static-contact-20260605`
- App Service plan: `EastUSPlan`
- Storage account: `iceforms20260605`

V2.8.46 runtime no-regression passed and the V2.8.46 live resource registry was created.
