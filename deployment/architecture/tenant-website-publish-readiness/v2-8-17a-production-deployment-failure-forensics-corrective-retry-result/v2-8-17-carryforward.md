# V2.8.17 Carryforward

V2.8.17 status: `production_deployment_failed`.

Carryforward facts:

- Target: `swa-ice-static-staging` in `rg-ice-static-staging`.
- Domains: `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`, both `Ready`.
- Failed artifact run: `sanitized_20260613014405`.
- Failed artifact hash: `b525b9fc70f32206c17b860a4f29579a26c350394272171bb021a2904fd2b042`.
- Attempt count: `1`.
- V2.8.17 command shape: `npx --yes @azure/static-web-apps-cli@2.0.9 deploy "<validated-artifact-root>" --env production`.
- Result: exit code `1`; no retry.
- Production route checks: not run because deployment failed.
- Safety boundary: no DNS, custom-domain, indexing, contact-form, CMS/provider, Azure infrastructure, app settings, RBAC, protected config, token-listing, keys/listKeys, connection string, or SAS action occurred.

V2.8.17A preserves these facts and adds the corrected dry-run classification: deployment auth/token validity is the blocker.
