# Azure Upload Target Requirements

V2.8.19D did not upload to Azure and did not query protected Azure configuration.

Target requirement state:

| Field | Current value | Status |
| --- | --- | --- |
| `targetStorageAccountOrProvider` | pending operator confirmation | unresolved |
| `targetContainer` | `ice-rink-rentals-media` | planned, still confirm before execution |
| `targetPathPrefix` | `ice-rink-rentals/` | planned |
| `publicBaseUrlOrCdnBaseUrl` | `https://media.iceskatingrinkrentals.com/` | planned, still confirm before execution |
| `authMode` | pending operator confirmation | unresolved |
| `identityOrSessionType` | pending operator confirmation | unresolved |
| `readbackMethod` | pending operator confirmation | unresolved |
| `contentTypeRules` | all current rows use `image/png` | resolved for current rows |
| `cacheControlPolicy` | pending operator confirmation | unresolved |
| `overwritePolicy` | pending operator confirmation | unresolved |

Execution readiness: false.

Required before any upload execution phase:

- Explicit operator approval that Azure media upload execution is allowed.
- Confirm storage/provider target and public base URL.
- Confirm authentication/session mode without printing or storing secrets.
- Confirm readback method.
- Confirm cache-control and overwrite policy.
- Confirm whether contact replacement rows remain excluded or become owner-approved.
