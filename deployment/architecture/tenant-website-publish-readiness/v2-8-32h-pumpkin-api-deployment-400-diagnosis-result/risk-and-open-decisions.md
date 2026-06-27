# Risk And Open Decisions

## Risks

- The live API is deployed but not health-ready.
- Downstream contact/provider integration would fail or hide the real startup blocker if attempted now.
- The most likely next blocker involves auth/JWT startup configuration, which may require either a secret setting approval or a code change to keep health routes independent from authentication startup failures.

## Open Decisions

- Approve a follow-up runtime diagnostic phase for the HTTP `500` health responses.
- Decide whether the health routes should bypass global authentication startup dependencies.
- Decide whether the live App Service should receive required JWT/provider secrets in a separate secret-binding phase.
- Decide whether a second code/artifact deployment is permitted if the approved fix is code-level.
