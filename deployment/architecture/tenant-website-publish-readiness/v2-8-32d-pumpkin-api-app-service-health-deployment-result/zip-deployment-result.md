# ZIP Deployment Result

Artifact: `.tmp/v2-8-32c/pumpkin-api.zip`

Target Web App: `app-pumpkin-api-prod-eastus-001`

Result: not attempted.

Reason: the planned App Service plan was not created because Azure returned an East US Total VMs quota blocker. The Web App also does not exist.

Deployment attempt count: `0`.

This preserves the V2.8.32D approval rule that the ZIP deployment may be sent exactly once only after the Web App exists and the artifact is valid.

