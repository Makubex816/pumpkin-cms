# Starter Deploy Result

- Target: `app-pumpkin-starter-preview-centralus-001` in `rg-pumpkin-api-prod-centralus`.
- Command class: one prebuilt ZIP deployment through `az webapp deploy`, with clean extraction, restart, and status tracking.
- Approved attempts: 1.
- Attempts used: 1.
- Deployment ID: `e0c6a833-ad50-4a8d-9ade-85475a529ea1`.
- Azure status: `RuntimeSuccessful`.
- Instances: 1 successful, 0 failed, 0 in progress.

No second deployment was attempted. The deployment succeeded technically, but live cross-tenant fidelity later failed because clean extraction removed the external Party Pros fixture.
