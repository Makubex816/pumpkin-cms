# Azure DNS Zone Readback

## Zone

| Field | Value |
| --- | --- |
| Name | `partyrentalphiladelphia.com` |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| Record set count | 6 |

## Target Nameservers

```text
ns1-03.azure-dns.com.
ns2-03.azure-dns.net.
ns3-03.azure-dns.org.
ns4-03.azure-dns.info.
```

## Records

| Name | Type | Value |
| --- | --- | --- |
| `@` | A | `20.118.48.17` |
| `asuid` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `www` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid.www` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Default Azure NS and SOA record sets are also present at `@`.
