# Nameserver Readback And Targets

Public DNS readback was performed with no registrar login and no mutation.

## Current Nameservers

| Tenant | Domain | Current nameservers |
| --- | --- | --- |
| Party Pros | `partyrentalphiladelphia.com` | `ns1.afternic.com`, `ns2.afternic.com` |
| Party Pros | `www.partyrentalphiladelphia.com` | `ns1.afternic.com`, `ns2.afternic.com` |
| Ice | `iceskatingrinkrentals.com` | `amy.ns.cloudflare.com`, `bob.ns.cloudflare.com` |
| Airstrip | `airstripclublasvegas.com` | `ns1.bluehost.com`, `ns2.bluehost.com` |

## Target Strategy

| Tenant | Selected OL strategy | Target nameservers | Action |
| --- | --- | --- | --- |
| Party Pros | Registrar-managed DNS by default | `ns1.afternic.com`, `ns2.afternic.com` | No nameserver change |
| Ice | Existing Cloudflare delegation | `amy.ns.cloudflare.com`, `bob.ns.cloudflare.com` | No nameserver change |
| Airstrip | Existing Bluehost delegation, read-only only | `ns1.bluehost.com`, `ns2.bluehost.com` | No nameserver change |

## Azure DNS

Visible Azure DNS zone readback returned no zones for:

- `partyrentalphiladelphia.com`
- `iceskatingrinkrentals.com`
- `airstripclublasvegas.com`

No Azure target nameservers exist in OL for Party Pros.

## Validation Commands

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
Resolve-DnsName -Name iceskatingrinkrentals.com -Type NS -Server 1.1.1.1
Resolve-DnsName -Name airstripclublasvegas.com -Type NS -Server 1.1.1.1
az resource list --resource-type Microsoft.Network/dnszones --query "[?name=='partyrentalphiladelphia.com' || name=='iceskatingrinkrentals.com' || name=='airstripclublasvegas.com'].{name:name, resourceGroup:resourceGroup, id:id}" -o json
```
