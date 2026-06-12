# Pre-Deployment Gate Result

Decision: blocked before deployment.

| Gate | Result |
| --- | --- |
| Isolated target exact name | passed |
| Isolated target default hostname | passed |
| Isolated target custom domains | passed, empty |
| Old target avoided | passed |
| Deployment auth env var | blocked, absent |
| Pinned SWA tooling | passed |
| Sanitized artifact | passed |
| Static validators | passed |
| Artifact security scan | passed |
| DNS/indexing/live-publication closed | passed |

Blocking gate:

```text
SWA_CLI_DEPLOYMENT_TOKEN is not present in the current terminal session.
```

No deployment command was run.

