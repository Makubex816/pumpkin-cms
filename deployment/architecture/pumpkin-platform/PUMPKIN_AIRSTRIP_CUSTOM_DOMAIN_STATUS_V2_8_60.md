# Pumpkin Airstrip Custom Domain Status V2.8.60

Status: Bluehost DNS owner action required.

Domains:

- `airstripclublasvegas.com`
- `www.airstripclublasvegas.com`

Read-only validation evidence:

- App Service external IP: `20.118.48.17`.
- App Service default host: `app-airstrip-prod-centralus-001.azurewebsites.net`.
- App Service custom domain verification ID: `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.
- Active nameservers: `ns1.bluehost.com`, `ns2.bluehost.com`.
- `airstripclublasvegas.com` A record: `66.81.203.198`.
- `www.airstripclublasvegas.com` A record: `66.81.203.198`.
- `asuid.airstripclublasvegas.com`: not found.
- `asuid.www.airstripclublasvegas.com`: not found.

Decision:

- Azure hostname binding was not attempted because Bluehost DNS validation is not ready.
- DNS registrar mutation was not approved and was not performed.
- Nameserver changes were not approved and were not performed.
- Azure DNS zone creation was not approved and was not performed.
- Custom-domain route proof was not run because domains were not bound.

Next safe action is a Bluehost DNS propagation validation and Azure hostname binding phase after owner adds the records from `PUMPKIN_AIRSTRIP_BLUEHOST_DNS_PACKET_V2_8_60.md`.
