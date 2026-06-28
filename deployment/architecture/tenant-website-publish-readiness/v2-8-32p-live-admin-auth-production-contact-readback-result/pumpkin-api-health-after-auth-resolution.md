# Pumpkin API Health After Auth Resolution

Status: not run.

Reason:

No valid auth path was selected. The saved JWT returned HTTP `401`, and the binding file lacked `adminJwtSecretValue`, so no auth binding or restart occurred.

Approved health URLs reserved for a successful auth path:

- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
- `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`

