# Bluehost DNS Record Packet

Result: created.

Provider decision:

- Keep Bluehost nameservers.
- Do not move to Azure DNS.
- Do not create an Azure DNS zone.
- Do not configure CDN or Front Door.
- Do not activate Google Workspace email DNS in this phase.

Azure App Service target:

- App Service: `app-airstrip-prod-centralus-001`.
- Default host: `app-airstrip-prod-centralus-001.azurewebsites.net`.
- Inbound IP: `20.118.48.17`.
- Custom domain verification ID: `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.

## Records To Add In Bluehost

| Purpose | Type | Bluehost Host | Value |
| --- | --- | --- | --- |
| Root web traffic | A | `@` | `20.118.48.17` |
| Root Azure ownership verification | TXT | `asuid` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |
| WWW web traffic | CNAME | `www` | `app-airstrip-prod-centralus-001.azurewebsites.net` |
| WWW Azure ownership verification | TXT | `asuid.www` | `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD` |

## Owner Replacement Notes

Current public DNS evidence:

- Active nameservers are `ns1.bluehost.com` and `ns2.bluehost.com`.
- Root `airstripclublasvegas.com` currently has A record `66.81.203.198`.
- `www.airstripclublasvegas.com` currently has A record `66.81.203.198`.
- Azure ownership TXT records are not present.

Owner action:

- Replace the root `@` A record value with `20.118.48.17`.
- Replace/remove the current `www` A record before adding the `www` CNAME. A CNAME cannot coexist with an A record for the same host.
- Add both `asuid` TXT records exactly as shown.
- Leave nameservers unchanged on Bluehost.
- Do not add Google Workspace MX/SPF/DKIM/DMARC records in this phase.
