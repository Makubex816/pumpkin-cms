# Deployment Result

Generated: 2026-06-06

## Command Shape

The SWA CLI was used through `npx` because `swa` was not installed globally:

```text
npx -y @azure/static-web-apps-cli deploy apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out --env production
```

The deployment token was supplied through the transient `SWA_CLI_DEPLOYMENT_TOKEN` environment variable. It was not printed or written to files.

## Result

| Check | Result |
| --- | --- |
| SWA CLI version | `2.0.9` |
| deployment command exit code | 0 |
| deployed URL | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| post-deployment provider | `SwaCli` |
| post-deployment environment status | `Ready` |
| custom hostnames after deployment | none |

No custom domain, DNS, Cloudflare, CMS, MediaAsset, Function App setting, endpoint, email, Microsoft 365, production cutover, or Roller action occurred.
