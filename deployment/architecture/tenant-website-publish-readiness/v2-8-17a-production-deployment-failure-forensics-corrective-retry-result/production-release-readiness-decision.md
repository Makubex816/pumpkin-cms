# Production Release Readiness Decision

Decision: no-go for corrective production retry.

Classification: `blocked_token_target_ambiguous`.

Production release is not verified. The static artifact and production target checks passed, but the deployment auth gate failed because the corrected dry-run rejected the current `SWA_CLI_DEPLOYMENT_TOKEN` as invalid.

Required before any future production retry:

- the operator must load a valid deployment token for `swa-ice-static-staging` into `SWA_CLI_DEPLOYMENT_TOKEN`;
- token value must remain hidden and must not be printed, listed, exported, logged, committed, or written to docs;
- no protected config or `.env.local` may be read to obtain it;
- a separate explicit approval must authorize the next bounded corrective retry;
- route checks remain closed until a successful deployment occurs.
