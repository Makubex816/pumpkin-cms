# V2.8.32G Carryforward

V2.8.32G created the selected Central US fallback target after East US quota constraints blocked the primary target.

Carryforward target:

- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

Carryforward blocker:

- V2.8.32G attempted one ZIP deploy.
- Azure surfaced the deployment as server-side HTTP `400`.
- Health checks were not run in V2.8.32G because deployment did not complete.

H diagnosis updated this classification: the failed deployment log shows Linux Kudu `rsync` invalid-argument failures caused by Windows-style backslash ZIP entry names.
