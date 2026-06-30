# Live Resource Inventory After Cleanup

Post-cleanup inventory:

| Resource group | Exists | Resource count | Result |
| --- | --- | ---: | --- |
| `rg-pumpkin-api-prod-centralus` | yes | 4 | live do-not-delete preserved |
| `rg-ice-static-staging` | yes | 2 | live do-not-delete preserved |
| `rg-ice-production-cosmos` | yes | 1 | live do-not-delete preserved |
| `rg-ice-production-media` | yes | 1 | live do-not-delete preserved |
| `rg-pumpkin-observability-prod-centralus` | yes | 8 | live do-not-delete preserved |
| `rg-ice-static-form-endpoint` | yes | 3 | deferred legacy stack preserved |
| `rg-pumpkin-api-prod-eastus` | no | 0 | deleted cleanup candidate |
| `rg-pumpkin-api-prod-eastus2` | no | 0 | deleted cleanup candidate |

No live resource was deleted.
