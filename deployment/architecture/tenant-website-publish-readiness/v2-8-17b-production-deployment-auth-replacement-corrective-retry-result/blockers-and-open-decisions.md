# Blockers And Open Decisions

## Active Blocker

Production release remains blocked by `corrective_deployment_failed_exit_code_1_no_retry_remaining`.

The replacement token was present and operator-confirmed, but the SWA CLI deployment client failed with exit code `1` during the one approved corrective production deployment attempt.

## Open Decisions

- Whether V2.8.17C should inspect local SWA deployment client state/logging under a no-token-reveal boundary.
- Whether an alternate deployment mechanism should be prepared after forensics.
- Whether a new deployment attempt should be approved later after tooling/auth remediation evidence exists.

No additional deployment attempt is authorized by V2.8.17B.

