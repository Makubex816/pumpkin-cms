# Public DNS Record Proof

Resolver: Cloudflare `1.1.1.1`

## Public Answers

| Name | Type | Value |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | NS | `ns1-03.azure-dns.com`, `ns2-03.azure-dns.net`, `ns3-03.azure-dns.org`, `ns4-03.azure-dns.info` |
| `partyrentalphiladelphia.com` | A | `20.118.48.17` |
| `www.partyrentalphiladelphia.com` | CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid.partyrentalphiladelphia.com` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `asuid.www.partyrentalphiladelphia.com` | TXT | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| `partyrentalphiladelphia.com` | MX | `.` preference `0` |
| `partyrentalphiladelphia.com` | TXT | `v=spf1 -all` |
| `_dmarc.partyrentalphiladelphia.com` | TXT | absent |

## Notes

The same no-email MX/TXT results were validated across Azure authoritative, Cloudflare, Google, and Quad9 after negative-cache expiry.
