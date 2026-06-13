# V2.8.14C Deployment Auth Retry And Scoped Isolated Staging Deployment Result

Status: complete.

Classification: `staging_publish_executed_and_verified`.

V2.8.14C retried the V2.8.14B auth-blocked boundary after confirming `SWA_CLI_DEPLOYMENT_TOKEN` was present by boolean-only checks in both PowerShell and Node. The token value was never printed, exported, listed, logged, written to docs, committed, or displayed.

Exactly one sanitized Ice static artifact deployment was executed with pinned SWA CLI tooling to the isolated Azure Static Web App target `swa-ice-static-isolated-staging` in `rg-ice-static-staging`. The deployment reported:

```text
https://kind-island-0a85a740f.7.azurestaticapps.net
```

Post-deploy bounded GET checks passed for only these routes:

```text
/
/service-areas
/contact
```

No deployment to `swa-ice-static-staging`, no production-domain deployment, no DNS change, no custom-domain mutation, no indexing, no live publication, no contact form submission, no contact endpoint POST, no crawl, no outbound URL checks, no CMS/provider writes, no Azure infrastructure creation, no app settings/resource configuration mutation, no RBAC assignment, no protected config read, no keys/listKeys, no connection strings, and no SAS occurred.

## Key Evidence

| Item | Result |
| --- | --- |
| Isolated target | `swa-ice-static-isolated-staging` |
| Resource group | `rg-ice-static-staging` |
| Default hostname | `kind-island-0a85a740f.7.azurestaticapps.net` |
| Custom domains | `[]` |
| SWA CLI | `npx --yes @azure/static-web-apps-cli@2.0.9` |
| Sanitized build run | `sanitized_20260612235412` |
| Artifact aggregate SHA-256 | `91b4158db0bfaa97922aaf22b367a2834ca11f7012ffaf6b3152adddb16c2c21` |
| Deployment attempts | `1` |
| Route checks | `3` GET checks, all `200 OK` |

## Next Gate

V2.8 is ready for post-staging verification and owner/operator signoff on the isolated default hostname only. Production release, DNS, indexing, custom domains, live publication, form submission, CMS writes, provider writes, and Azure configuration changes remain closed.
