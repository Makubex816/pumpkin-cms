# Party Pros DNS Nameserver Manual Packet

Tenant: `party-pros-philadelphia`

Domain: `partyrentalphiladelphia.com`

WWW: `www.partyrentalphiladelphia.com`

## OL Boundary

No registrar login occurred.

No Bluehost login occurred.

No DNS record was changed.

No nameserver was changed.

No Azure DNS zone was created.

No App Service custom-domain binding was created.

## Current Public Nameserver Readback

Read through public DNS on 2026-07-09:

| Name | Type | Values |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | NS | `ns1.afternic.com`, `ns2.afternic.com` |
| `www.partyrentalphiladelphia.com` | NS | `ns1.afternic.com`, `ns2.afternic.com` |

## Current Public DNS Readback

| Name | Type | Values |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | A | `76.223.54.146`, `13.248.169.48` |
| `partyrentalphiladelphia.com` | TXT | `v=spf1 -all` |
| `partyrentalphiladelphia.com` | CNAME | no CNAME answer; resolver returned SOA/no CNAME |
| `www.partyrentalphiladelphia.com` | A | `76.223.54.146`, `13.248.169.48` |
| `www.partyrentalphiladelphia.com` | TXT | `v=spf1 -all` |
| `www.partyrentalphiladelphia.com` | CNAME | no CNAME answer; resolver returned SOA/no CNAME |

## Selected Strategy

Selected OL strategy: registrar-managed DNS by default.

Nameserver action in OL: no change.

Target nameservers for the selected registrar-managed strategy:

```text
ns1.afternic.com
ns2.afternic.com
```

Because no nameserver change is selected, the target nameservers are the current public authoritative nameservers.

## Future Custom-Domain DNS Records

These records are for a future owner-approved custom-domain phase only. They were not applied in OL.

Recheck the App Service default host and verification id immediately before applying records.

| Host | Type | Target/value | Notes |
| --- | --- | --- | --- |
| `@` | A | `20.118.48.17` | Current A readback for `app-pumpkin-starter-preview-centralus-001.azurewebsites.net`; recheck before cutover |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | App Service custom domain verification value |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` | Future www target |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` | App Service custom domain verification value |

## Azure DNS Target Nameserver Status

No Azure DNS zone for `partyrentalphiladelphia.com` exists in the visible subscription readback.

Therefore there are no Azure DNS target nameserver values to provide in OL.

Do not use Azure nameserver values from another tenant. Do not guess Azure nameserver values.

If Azure DNS delegation is later approved, a separate Azure DNS zone creation/assignment phase must create the zone and read its actual `nameServers` output.

## Manual Owner Steps For Future Registrar-Managed DNS

Only after a separate owner approval:

1. Confirm the DNS manager that currently controls `ns1.afternic.com` and `ns2.afternic.com`, or approve a separate nameserver change to the intended provider.
2. Re-read the current nameservers.
3. Re-read the App Service default host and verification id.
4. Add or replace only the approved DNS records in the active DNS manager.
5. Wait for DNS propagation.
6. Run the validation commands below.
7. Only after DNS validates, request a separate App Service custom-domain binding approval.

## Validation Commands

Read current nameservers:

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
Resolve-DnsName -Name www.partyrentalphiladelphia.com -Type NS -Server 1.1.1.1
```

Read current records:

```powershell
Resolve-DnsName -Name partyrentalphiladelphia.com -Type A -Server 1.1.1.1
Resolve-DnsName -Name partyrentalphiladelphia.com -Type TXT -Server 1.1.1.1
Resolve-DnsName -Name www.partyrentalphiladelphia.com -Type A -Server 1.1.1.1
Resolve-DnsName -Name www.partyrentalphiladelphia.com -Type CNAME -Server 1.1.1.1
```

Read visible Azure DNS zones:

```powershell
az resource list --resource-type Microsoft.Network/dnszones --query "[?name=='partyrentalphiladelphia.com'].{name:name, resourceGroup:resourceGroup, id:id}" -o json
```

Read App Service hostname metadata:

```powershell
az webapp show --resource-group rg-pumpkin-api-prod-centralus --name app-pumpkin-starter-preview-centralus-001 --query "{defaultHostName:defaultHostName, customDomainVerificationId:customDomainVerificationId}" -o json
Resolve-DnsName -Name app-pumpkin-starter-preview-centralus-001.azurewebsites.net -Type A -Server 1.1.1.1
```
