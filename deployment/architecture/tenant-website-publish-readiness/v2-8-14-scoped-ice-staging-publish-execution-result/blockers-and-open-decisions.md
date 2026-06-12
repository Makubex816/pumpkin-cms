# Blockers And Open Decisions

Blocking items:

- The approved target has production custom domains attached: `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com`.
- No expected deployment-token environment variable is present in the current terminal session.
- `swa` CLI is not available on PATH.

Open decisions:

- Whether to create/use a staging-only SWA target with no production custom domains.
- Whether to remove or remediate production custom domains from the current target under a separate approval.
- Which exact repo-supported deployment token environment variable should be supplied for the next execution attempt.
- Whether installing/using SWA CLI is approved or whether a different repo-supported upload method should be used.

