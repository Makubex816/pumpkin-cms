# Rollback Plan

## Source Rollback

If the health route change must be reverted before deployment:

1. Remove `GetHealth`, `GET /api/health`, and `GET /health` from `apps/pumpkin-api/Program.cs`.
2. Remove `--v2-8-32c` dispatch from `apps/pumpkin-api.Tests/Program.cs`.
3. Remove `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`.
4. Remove the opt-in `ExcludeAppSettingsFromPublish` item group from `apps/pumpkin-api/pumpkin-api.csproj` only if artifact config exclusion is no longer desired.

## Artifact Rollback

Delete generated local evidence under `.tmp/v2-8-32c/`. This directory is ignored and must not be staged.

## Future Deployment Rollback

In a later approved deployment phase, keep the prior zip hash, deployed zip hash, App Service resource id, and app setting name manifest. If smoke tests fail, rollback should redeploy the prior approved artifact or stop the new app before binding public/static contact traffic.
