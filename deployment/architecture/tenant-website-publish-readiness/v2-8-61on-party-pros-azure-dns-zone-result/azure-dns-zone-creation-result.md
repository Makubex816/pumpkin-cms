# Azure DNS Zone Creation Result

## Result

Azure DNS zone created/read back:

| Field | Value |
| --- | --- |
| Name | `partyrentalphiladelphia.com` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Location | `global` |
| Resource type | `Microsoft.Network/dnszones` |
| Resource id | `/subscriptions/ff887def-fd83-4a19-9298-13d4b1687873/resourceGroups/rg-pumpkin-api-prod-centralus/providers/Microsoft.Network/dnszones/partyrentalphiladelphia.com` |
| Record set count after staging | 5 |

## Creation Notes

The first Azure CLI zone-create command timed out locally and left no zone behind on readback.

The zone was then created through Azure Resource Manager for the same approved resource. No token value was printed or stored.

## Boundary

No new resource group was created.

No registrar DNS was changed.
