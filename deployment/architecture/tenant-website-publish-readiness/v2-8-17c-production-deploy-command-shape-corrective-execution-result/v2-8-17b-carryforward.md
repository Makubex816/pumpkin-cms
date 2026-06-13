# V2.8.17B Carryforward

V2.8.17B classified the previous attempt as `corrective_deployment_failed_exit_code_1_no_retry_remaining`.

Carryforward facts from the local V2.8.17B result:

- Production target: `swa-ice-static-staging`.
- Resource group: `rg-ice-static-staging`.
- Production domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Domain status in V2.8.17B: `Ready`.
- SWA CLI version: `2.0.9`.
- V2.8.17B sent exactly one deployment attempt and did not retry.
- V2.8.17B route checks were not run because deployment did not succeed.

Additional V2.8.17C approval-context carryforward:

- `EnvTokenMatchesCurrentTargetToken` had already been proven true for `swa-ice-static-staging`.
- The suspected blocker was command shape rather than token presence or token-target mismatch.
- Dry-run deploy behavior was not to be repeated as readiness evidence.

