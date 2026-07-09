# Future Azure DNS Delegation Readiness

## Current Azure DNS State

Read-only Azure resource query returned:

```json
[]
```

for checked zones:

- `partyrentalphiladelphia.com`
- `iceskatingrinkrentals.com`
- `airstripclublasvegas.com`

`partyrentalphiladelphia.com` also returned `ResourceNotFound` when checked directly in the known Pumpkin resource group.

## Result

No Azure DNS zone exists for Party Pros in the visible subscription.

No Azure target nameservers can be listed for Party Pros in OL.

## Rule

Do not invent Azure nameservers.

Do not copy Azure nameservers from another tenant.

Do not publish a packet that says Azure DNS is the target unless the actual zone exists and the actual `nameServers` values have been read back from that zone.

## Future Phase Requirements

A future Azure DNS delegation phase must be separately approved and must:

- create or identify the correct Azure DNS zone;
- read the actual zone `nameServers` values;
- update the manual DNS packet with those exact values;
- obtain owner approval for any registrar nameserver change;
- validate delegation after propagation;
- keep custom-domain binding approval separate unless explicitly combined by owner.

## Readback Commands For A Future Existing Zone

Use read commands only until a separate mutation approval exists:

```powershell
az resource list --resource-type Microsoft.Network/dnszones --query "[?name=='partyrentalphiladelphia.com'].{name:name, resourceGroup:resourceGroup, id:id}" -o json
az network dns zone show --resource-group <approved-resource-group> --name partyrentalphiladelphia.com --query "nameServers" -o tsv
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
```
