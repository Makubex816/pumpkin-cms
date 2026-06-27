# Risk And Open Decisions

Date: 2026-06-27

## Risks

- East US Total VMs quota remains `0`, blocking the planned Linux B1 App Service plan.
- The support ticket was not CLI-visible in V2.8.32F, so approval still needs portal or support confirmation.
- Repeating the same plan creation attempt before quota changes will likely fail again.
- The live API cannot be proven until the plan, Web App, deployment, and health checks complete.

## Open Decisions

- Confirm quota approval or escalate the quota request through the Azure portal/support path.
- After quota approval, approve a bounded V2.8.32G-R retry.
- After health succeeds, approve a separate provider-binding and contact validation phase.

## Current Decision

Path A remains selected, but it is unresolvable until quota is approved.
