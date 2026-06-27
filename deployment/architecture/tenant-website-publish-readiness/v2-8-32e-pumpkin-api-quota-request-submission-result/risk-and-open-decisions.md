# Risk And Open Decisions

Date: 2026-06-27

## Risks

- The Azure Support API did not confirm the ticket by the provided ticket name in this phase.
- Quota approval is still pending, so the App Service plan cannot be retried.
- The live Pumpkin API cannot be proven until the plan, Web App, deployment, and health checks complete under future approval.
- Switching region, SKU, or target would break the Path A evidence chain and requires separate approval.

## Open Decisions

- Wait for quota approval versus approving a new alternate target.
- After quota approval, approve a V2.8.32D retry for health-only deployment.
- After health-only proof, approve protected provider binding and bounded FormEntry read/write validation.

## Current Decision

Path A is selected and remains active.
