# Health Recovery Fix Result

Files changed:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`

Source fix:

- Added null/whitespace guard around `Jwt:SecretKey`.
- Missing JWT secret now returns no authentication result instead of throwing.
- Direct nullable secret encoding was removed from JWT bearer option setup.
- Health routes explicitly call `.AllowAnonymous()`.
- Health paths are routed around the scoped auth branch.

Test fix:

- Extended the V2.8.32C health readiness runner to assert health routes are anonymous.
- Added assertions that the health bypass does not read config/secrets.
- Added assertions that JWT options guard missing `Jwt:SecretKey`.

Live status:

The final null-safe JWT fix was not deployed in I because the single approved live deployment attempt had already been used. Local no-secret health passed from the fixed artifact.
