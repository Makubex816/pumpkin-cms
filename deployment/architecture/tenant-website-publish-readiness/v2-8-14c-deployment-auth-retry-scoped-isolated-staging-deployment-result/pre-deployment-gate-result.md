# Pre-Deployment Gate Result

Status: passed.

| Gate | Result |
| --- | --- |
| Start-state review | Passed; worktree busy, no staged files |
| Isolated target exact name | Passed: `swa-ice-static-isolated-staging` |
| Isolated target resource group | Passed: `rg-ice-static-staging` |
| Isolated default hostname | Passed: `kind-island-0a85a740f.7.azurestaticapps.net` |
| Isolated custom domains | Passed: `[]` |
| Old target exclusion | Passed: `swa-ice-static-staging` not used |
| Deployment auth presence | Passed in PowerShell and Node by boolean-only checks |
| Token value handling | Passed; value never printed, exported, listed, logged, or written |
| Pinned SWA CLI tooling | Passed: `2.0.9` |
| Sanitized static build | Passed: `sanitized_20260612235412` |
| Static source validation | Passed with 34 existing content/workflow warnings |
| Type-check | Passed |
| Static output validator | Passed |
| Staging package validator | Passed |
| Artifact root/security scan | Passed |
| Runtime QA support gate | Passed |
| Resource Registry support gate | Passed |
| OLM/provider profile support gate | Passed |
| Static form endpoint support gate | Passed |

All required pre-deployment gates passed before the scoped deployment command was run.
