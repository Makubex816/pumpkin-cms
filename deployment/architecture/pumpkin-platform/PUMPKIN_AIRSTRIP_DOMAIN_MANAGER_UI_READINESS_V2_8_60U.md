# Airstrip Domain Manager UI Readiness V2.8.60U

Status: UI ready; cutover not ready.

Airstrip DomainBinding:

- Tenant: `airstrip-club-las-vegas`
- Domain: `airstripclublasvegas.com`
- WWW domain: `www.airstripclublasvegas.com`
- Provider: `bluehost`
- Hosting target: `app-airstrip-prod-centralus-001`
- Status: `pending_dns_records`
- DNS validation: `pending`

DNS packet displayed in the UI:

| Type | Host | Name | Value |
| --- | --- | --- | --- |
| A | `@` | `airstripclublasvegas.com` | `20.118.48.17` |
| TXT | `asuid` | `asuid.airstripclublasvegas.com` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| CNAME | `www` | `www.airstripclublasvegas.com` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| TXT | `asuid.www` | `asuid.www.airstripclublasvegas.com` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Read-only DNS validation in the UI still shows pending. V2.8.60V should start only after owner DNS entry is approved and applied.
