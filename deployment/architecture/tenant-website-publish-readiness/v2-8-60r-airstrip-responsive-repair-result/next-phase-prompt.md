# Next Phase Prompt

Approve V2.8.61R Airstrip Bluehost DNS Propagation Validation, Azure Custom Domain Binding, Managed TLS, Production Custom-Domain Runtime Proof, Ice No-Regression, and No-Indexing Closeout only.

Carryforward:

- V2.8.60R completed Airstrip responsive repair.
- Production default host is mobile/tablet/desktop proofed:
  - `https://app-airstrip-prod-centralus-001.azurewebsites.net`
- V2.8.61 manual Bluehost DNS handoff already documented the owner records:
  - A `@` -> `20.118.48.17`
  - TXT `asuid` -> `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`
  - CNAME `www` -> `app-airstrip-prod-centralus-001.azurewebsites.net`
  - TXT `asuid.www` -> `17FA81D26688CC438E7CF3402F33A438B12FDB881933AB1322B14006013C1FCD`

Required scope:

- Confirm active subscription `ff887def-fd83-4a19-9298-13d4b1687873`.
- Recheck public DNS for apex A, www CNAME, and both TXT records.
- If DNS is ready, bind `airstripclublasvegas.com` and `www.airstripclublasvegas.com` to `app-airstrip-prod-centralus-001`.
- Enable managed TLS only after bindings succeed.
- Prove runtime for apex and www custom domains.
- Prove Airstrip default host no-regression.
- Prove Ice no-regression.
- Do not change nameservers.
- Do not change MX, SPF, DKIM, DMARC, or Google Workspace records.
- Do not create Azure DNS.
- Do not configure CDN or Front Door.
- Do not deploy.
- Do not submit forms, contact posts, media uploads, or content writes.
- Do not run indexing or Search Console actions.

Hard stop:

- If DNS records do not match the expected values, stop before Azure binding and report exact missing or mismatched records.
