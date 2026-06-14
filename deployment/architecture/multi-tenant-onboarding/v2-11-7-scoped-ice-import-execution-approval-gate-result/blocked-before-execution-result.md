# Blocked Before Execution Result

Result: blocked before execution.

| Gate | Status |
| --- | --- |
| Ice package hash matches expected hash | Passed |
| Approval manifest targets Ice only | Passed for dry-run manifest |
| `executionApprovalGranted` true | Blocked |
| `operatorApproval.approved` true | Blocked |
| `approvedAt` and `approvedBy` present | Blocked |
| Roller excluded and paused/no-import/no-resume | Passed |
| Target mode explicit and executable | Blocked |
| Exact import target resolved | Blocked |
| Backup Center prerequisite | Passed |
| Resource Registry prerequisite | Passed |
| Provider Profile prerequisite | Passed |
| Runtime QA prerequisite | Passed |
| OLM carryforward | Passed |
| Audit Jobs carryforward | Passed |
| Rollback plan | Passed |
| Readback plan ID | Passed as planned ID only |
| Repo-supported write command | Blocked |
| Repo-supported readback command | Blocked |
| Protected config required | Passed: not required for the local dry-run, not read |
| Secrets required | Passed: no secret values read or exported |

Stop condition: execution cannot proceed safely without the exact missing approval, target, write-command, and readback-command values.

