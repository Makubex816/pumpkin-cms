# Risk And Open Decisions

## Blocker

East US quota currently blocks the planned Linux App Service plan:

- Current Limit (Total VMs): `0`
- Current Usage: `0`
- Required for deployment: `1`
- Minimum new limit requested by Azure: `1`

## Risks

- The live API cannot be proven until the App Service plan and Web App exist.
- Provider binding before health-only deployment would mix infrastructure and protected-secret risk.
- Switching region or SKU without a specific approval would break the planned-target evidence chain.

## Open Decisions

- Request/approve East US quota increase for at least one Total VM, or approve a specifically named alternate hosting target.
- After quota is resolved, resume V2.8.32D with one ZIP deployment attempt and only the two approved health GETs.
- After successful health-only proof, approve a separate protected provider-binding and FormEntry validation phase.

