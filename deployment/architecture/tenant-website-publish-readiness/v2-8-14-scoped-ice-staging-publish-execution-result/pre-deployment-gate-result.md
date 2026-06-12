# Pre-Deployment Gate Result

Classification: `blocked_before_deployment`.

Passed gates:

- V2.8.13 backend verification carryforward exists.
- Sanitized build passed.
- Static source validation passed with existing warnings.
- Static output validator passed.
- Staging package validator passed.
- Artifact route/file checks passed.
- Artifact high-confidence secret scan passed.

Blocking gates:

- Azure read-only metadata reports production custom domains attached to the approved target.
- No expected deployment-token environment variable is present in the current terminal session.
- `swa` CLI is not available on PATH.

