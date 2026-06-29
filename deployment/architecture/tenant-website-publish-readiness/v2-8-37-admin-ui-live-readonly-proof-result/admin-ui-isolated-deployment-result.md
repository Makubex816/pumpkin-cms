# Admin UI Isolated Deployment Result

Deployment attempted: yes.

Deployment count: exactly one isolated deployment attempt.

Result:

- Azure CLI command reached OneDeploy/Kudu.
- Deployment failed with HTTP 400.
- Deployment ID: `45998942-bc56-47ff-a3a0-976e76c1a3ed`.
- Deployment record status: failed (`status: 3`).
- Top-level log ended with `Deployment Failed. deployer = OneDeploy deploymentPath = OneDeploy`.

Classification:

`isolated_onedeploy_failed_before_runtime_proof`.

Production deployment was not attempted.
