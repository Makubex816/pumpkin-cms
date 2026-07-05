# Deploy Retry Result

Status: passed.

Pre-deploy:

- Focused password-route tests passed.
- Pumpkin API Release build passed.
- Azure subscription verified as `Azure subscription 1`.
- No active Kudu/OneDeploy deployment was in progress.

Artifact:

- Published Pumpkin API to ignored `.tmp/v2-8-60wa/`.
- Created protected-config-excluded POSIX ZIP.
- ZIP entry count: 56.
- Backslash entry count: 0.
- Protected config entry count: 0.

Deploy:

- Target Web App: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deploy attempts in V2.8.60W-A: 1.
- Deployment id: `81fe72d5-eb79-430f-aa73-511f487eb422`.
- Deployment status: `RuntimeSuccessful`.
- Latest Kudu deployment status: 4.

Post-deploy health:

- `/health`: HTTP 200.
- `/api/health`: HTTP 200.
