# Custom Domain Validation Result

Result: not ready.

Validation targets:

- `airstripclublasvegas.com`
- `www.airstripclublasvegas.com`

Expected:

- Root A record points to `20.118.48.17`.
- Root TXT host `asuid` equals `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.
- WWW CNAME points to `app-airstrip-prod-centralus-001.azurewebsites.net`.
- WWW TXT host `asuid.www` equals `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`.

Observed:

- Nameservers: `ns1.bluehost.com`, `ns2.bluehost.com`.
- Root A record: `66.81.203.198`.
- WWW A record: `66.81.203.198`.
- Root `asuid` TXT: not found.
- WWW `asuid.www` TXT: not found.

Decision:

- Azure App Service hostname binding was skipped.
- HTTPS custom-domain route proof was not run.
