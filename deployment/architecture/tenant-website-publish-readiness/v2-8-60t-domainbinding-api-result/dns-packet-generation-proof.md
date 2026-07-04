# DNS Packet Generation Proof

Status: passed.

Endpoint:

- POST `/api/admin/tenants/airstrip-club-las-vegas/domain-bindings/domainbinding-airstrip-club-las-vegas-airstripclublasvegas-com/generate-dns-packet`

Result:

- HTTP 200
- Record count: 4

Generated packet:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `20.118.48.17` |
| TXT | `asuid` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| CNAME | `www` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| TXT | `asuid.www` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Comparison:

- Matches the V2.8.60 Airstrip Bluehost packet.

No DNS mutation occurred.

