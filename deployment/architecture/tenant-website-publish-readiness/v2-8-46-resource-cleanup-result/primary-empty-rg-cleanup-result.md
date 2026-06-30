# Primary Empty Resource Group Cleanup Result

| Resource group | Resource count before delete | Lock count before delete | Delete attempted | Final state |
| --- | ---: | ---: | --- | --- |
| `rg-pumpkin-api-prod-eastus` | 0 | 0 | yes | absent after delete |
| `rg-pumpkin-api-prod-eastus2` | 0 | 0 | yes | absent after delete |

The delete script refused live/deferred group names and refused non-empty groups. No live resource group was deleted.
