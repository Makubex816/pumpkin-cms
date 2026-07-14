# App Service DNS Target Readback

Fresh non-secret metadata readback targeted `app-pumpkin-starter-preview-centralus-001` in `rg-pumpkin-api-prod-centralus`.

| Field | Readback |
| --- | --- |
| State | `Running` |
| Default hostname | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| Azure-supported external inbound IPv4 | `20.118.48.17` |
| Custom-domain verification ID | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| HTTPS-only | true |
| Existing hostnames | default hostname plus the two Party Pros hostnames |
| Vegas hostname bound | false |
| Vegas certificate count | 0 |

The inbound address came from Azure CLI hostname metadata, not an outbound address or DNS resolution of the default host. No appsetting values were read or printed.
