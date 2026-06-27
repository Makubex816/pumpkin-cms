# Risk And Open Decisions

Date: 2026-06-27

## Risks

- The selected Central US Web App exists, but deployment failed server-side with HTTP `400`.
- The selected API URL is not canonical until health checks pass.
- East US and East US 2 remain quota-blocked for App Service plan creation.
- Resource cleanup is deferred and requires separate approval.

## Open Decisions

- Approve bounded deployment diagnostics for the selected Web App.
- Decide whether to keep Central US as the target after deployment succeeds.
- After health succeeds, approve protected provider binding and contact validation separately.
