# Rollback Abort Result

Status: aborted after failed deployment attempt.

No rollback command was run because the deployment did not report success and no successful production route verification occurred in this phase.

Abort state:

| Field | Value |
| --- | --- |
| Deployment attempt sent | `true` |
| Attempt count | `1` |
| Deployment success | `false` |
| Route verification run | `false` |
| Rollback command run | `false` |
| Broad retry | `false` |

Next action is failure triage and a separately approved reattempt or rollback plan if needed.

