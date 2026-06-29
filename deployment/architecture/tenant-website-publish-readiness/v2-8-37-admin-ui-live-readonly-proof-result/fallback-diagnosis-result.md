# Fallback Diagnosis Result

Fallback path used:

Approved App Service fallback on existing Pumpkin API plan.

Why:

- Static Web Apps direct artifact deploy was not available.
- Next build emitted dynamic routes.

Blocker:

`isolated_onedeploy_failed_before_runtime_proof`.

Observed evidence:

- App Service target created successfully.
- Artifact built and served locally.
- OneDeploy/Kudu returned HTTP 400.
- Deployment record status was failed (`status: 3`).
- Isolated default host returned 503.

Next likely repair:

Use a follow-up approval to inspect detailed Kudu deployment logs and try a different App Service deployment method or package shape, such as ZipDeploy with extracted standalone layout, Run From Package configuration, or a containerized Node artifact. Do not proceed to production until isolated runtime proof passes.
