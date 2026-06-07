# Deployment Profile Manifest Spec

Required fields:

- `schemaVersion`
- `profileId`
- `displayName`
- `supportedTenants`
- `requiredInfra`
- `requiredEnvVars`
- `requiredValidators`
- `deploymentSteps`
- `smokeTests`
- `approvalGates`
- `rollbackSteps`
- `unsupportedActions`
- `indexingFinalGate`

Runtime environment variables may be named, but values must never be stored in profile manifests.

