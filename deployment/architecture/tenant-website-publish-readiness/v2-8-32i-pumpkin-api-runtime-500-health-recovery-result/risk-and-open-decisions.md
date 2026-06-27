# Risk And Open Decisions

## Risks

- Live API health remains HTTP `500` until the locally validated fix is deployed.
- The first I deployment did not contain the final null-safe JWT fix.
- Provider/contact binding before health passes would obscure the active runtime blocker.

## Open Decisions

- Approve one deploy-only follow-up for the local fixed artifact/source.
- Decide whether the live App Service should later receive JWT secrets for Admin routes in a separate secret-binding phase.
- Decide when to re-open provider/contact binding after health passes.
