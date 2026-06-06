# Recommended Cutover Strategy

Generated: 2026-06-06

## Recommendation

Use the existing Azure Static Web Apps default environment as the production custom-domain target:

```text
Static Web App: swa-ice-static-staging
resource group: rg-ice-static-staging
default hostname: happy-mud-0b375e20f.7.azurestaticapps.net
```

This resource is already serving the verified Ice static artifact and has passed default-host staging checks.

If using a staging-named resource for production domains is not acceptable, stop before cutover and request separate approval to create and deploy a production-named Static Web App.

## Canonical Host

Use apex/root as canonical:

```text
https://iceskatingrinkrentals.com
```

The current static output already uses apex canonical and sitemap URLs.

## Future Execution Sequence

After explicit cutover approval only:

1. Reconfirm staging default hostname routes and form OPTIONS.
2. Capture current Cloudflare root and `www` records outside the repo.
3. Start Azure custom-domain binding for `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`.
4. Add only Azure-required Cloudflare validation records.
5. After Azure validates the hostnames, change only root and `www` DNS records to the Azure Static Web Apps target.
6. Keep root and `www` DNS-only during first production smoke tests.
7. Run production smoke tests on root and `www`.
8. If approved, add a Cloudflare redirect from `www` to root, or defer redirect and rely on canonical tags temporarily.
9. Do not change `media`, MX, TXT, or autodiscover records.
10. Do not submit production sitemap/indexing until live smoke tests pass.

## DNS Record Direction

Expected future direction, subject to Azure validation output:

- apex/root: TXT validation plus ALIAS/CNAME-flattened or Azure-required target through Cloudflare
- `www`: CNAME or TXT validation plus CNAME to the Azure Static Web Apps target

Do not assume the final record names or validation tokens until Azure provides them during the approved binding workflow.

## Stop Points

Stop and rollback or request approval if:

- Azure custom-domain validation does not complete
- root or `www` HTTPS fails after DNS change
- approved content routes do not return 200
- media fails
- form OPTIONS for root or `www` fails
- unexpected noindex/canonical output appears
- Cloudflare changes beyond root/www DNS and approved redirect are required
