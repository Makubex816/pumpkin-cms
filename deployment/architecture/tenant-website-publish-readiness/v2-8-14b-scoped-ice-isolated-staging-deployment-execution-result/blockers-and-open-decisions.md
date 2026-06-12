# Blockers And Open Decisions

Active blocker:

```text
SWA_CLI_DEPLOYMENT_TOKEN is absent from the current terminal session.
```

Open decision:

- Whether the operator is ready to retry V2.8.14C after placing the isolated target deployment token in `SWA_CLI_DEPLOYMENT_TOKEN`.

Closed/non-blocking:

- Target isolation is resolved.
- Old production-domain target is not used.
- Tooling path is available.
- Artifact validation passed.
- Backend form endpoint verification is carried forward from V2.8.13.

