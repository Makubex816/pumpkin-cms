# Custom Domain Binding Result

Result: not attempted because Bluehost DNS owner action is required.

Custom domains in scope:

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

- Hostname binding was not attempted because DNS validation is not ready.
- DNS registrar mutation was not approved and was not performed.
- Phase closes as default-host live with Bluehost DNS owner action required.

Expected next DNS owner action:

- In Bluehost, replace the root `@` A record with `20.118.48.17`.
- In Bluehost, add TXT host `asuid` with value `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.
- In Bluehost, replace the current `www` A record with a CNAME to `app-airstrip-prod-centralus-001.azurewebsites.net`.
- In Bluehost, add TXT host `asuid.www` with value `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.
- Return for Azure hostname binding and TLS proof after DNS propagation.
