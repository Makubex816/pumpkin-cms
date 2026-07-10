# Azure DNS Zone Record Readback

Zone: `partyrentalphiladelphia.com`

Resource group: `rg-pumpkin-api-prod-centralus`

## Records

| Name | Type | TTL | Value |
| --- | --- | ---: | --- |
| `@` | A | 3600 | `20.118.48.17` |
| `@` | NS | 172800 | Azure-assigned nameservers |
| `@` | SOA | 3600 | Azure SOA |
| `@` | MX | 3600 | `.` preference `0` |
| `@` | TXT | 3600 | `v=spf1 -all` |
| `asuid` | TXT | 3600 | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `www` | CNAME | 3600 | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid.www` | TXT | 3600 | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

## Hostname Binding Readback

App Service hostname list still shows only:

```text
app-pumpkin-starter-preview-centralus-001.azurewebsites.net
```

No Party Pros custom hostname binding exists.

No managed TLS exists.
