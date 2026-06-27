# Risk And Open Decisions

Date: 2026-06-27

## Risks

- The operator-submitted support ticket is still not visible through the Azure Support CLI.
- The support ticket list returned empty, so approval cannot be confirmed from CLI metadata.
- The App Service plan and Web App remain absent.
- Health-only deployment cannot proceed until quota approval and explicit retry approval are both present.

## Open Decisions

- Determine whether the quota request is visible in the Azure portal or under a different support ticket identifier.
- Continue read-only quota polling until approval, denial, or a clear support path is known.
- After approval, request separate health-only retry approval.

## Current Decision

Path A remains selected, but retry remains blocked.
