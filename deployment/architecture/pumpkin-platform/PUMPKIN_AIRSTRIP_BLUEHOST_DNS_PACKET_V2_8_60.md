# Pumpkin Airstrip Bluehost DNS Packet V2.8.60

Status: owner action required.

Keep Bluehost nameservers active. Do not move this domain to Azure DNS for this phase.

Azure App Service target:

- App Service: `app-airstrip-prod-centralus-001`.
- Default host: `app-airstrip-prod-centralus-001.azurewebsites.net`.
- Inbound IP: `20.118.48.17`.
- Custom domain verification ID: `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.

Required Bluehost records:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `20.118.48.17` |
| TXT | `asuid` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| CNAME | `www` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| TXT | `asuid.www` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

Current public DNS blocker:

- Root A currently points to `66.81.203.198`.
- WWW A currently points to `66.81.203.198`.
- Ownership TXT records are absent.

No Azure DNS zone, nameserver change, Google Workspace email DNS activation, CDN, or Front Door action occurred in V2.8.60.
