# Blockers And Open Decisions

## Blockers

| Blocker | Required resolution |
| --- | --- |
| Final deployment parameter set missing | Create a non-example parameter file or exact parameter worksheet for V2.3.3. |
| Placeholder tag remains | Replace `future-approved-azure-creation-phase` with the approved creation phase value. |
| Resource group not created | Explicitly approve creation or select an existing safe staging group. |
| Reviewed subscription/tenant target incomplete | Record stable reviewed target identifiers safely or provide an operator worksheet that can be validated without printing secrets. |
| Naming differences remain | Reconcile naming plan examples with Bicep-derived values. |
| RBAC not explicit | Provide principal, role, and staging-limited scope or defer RBAC. |
| Cost guardrail owner not explicit | Provide owner/cost/cleanup tags and budget decision. |
| Provider profile not finalized | Register a repo-supported profile after resources exist. |

## Open Decisions

- Whether V2.3.3 should create the resource group first, then run group-level what-if and deployment.
- Whether the first creation phase should include diagnostics or defer Log Analytics/Application Insights.
- Whether the first write will use operator Azure CLI session or managed identity.
- Whether budget/cost alert is required before resource creation or immediately after.

