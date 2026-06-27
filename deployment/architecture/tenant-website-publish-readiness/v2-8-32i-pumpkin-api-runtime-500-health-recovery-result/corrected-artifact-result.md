# Corrected Artifact Result

## Deployed I Artifact

Path:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-posix.zip`

SHA256:

`1DDD81DC000E4B1FC9F7E2C1BA7938B166D1CE5156B0E42A174B6E55F18BA2AA`

Structure:

- Entries: `56`
- Backslash ZIP entries: `0`
- Appsettings/local/env-like entries: `0`
- Root `pumpkin-api.dll`: present
- Root `pumpkin-api.runtimeconfig.json`: present
- Root `pumpkin-api.deps.json`: present
- Root `web.config`: present

This artifact was deployed once, but live health remained HTTP `500`.

## Local Fixed Artifact

Path:

`.tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip`

SHA256:

`722BC5B481043FF0B9B9B4566B2B23A52D93E7D6FDF3378087352F4904276D58`

Structure:

- Entries: `56`
- Backslash ZIP entries: `0`
- Appsettings/local/env-like entries: `0`
- Root `pumpkin-api.dll`: present
- Root `pumpkin-api.runtimeconfig.json`: present
- Root `pumpkin-api.deps.json`: present
- Root `web.config`: present

This artifact includes the null-safe JWT fix and passed local no-secret health checks. It was not deployed in I.
