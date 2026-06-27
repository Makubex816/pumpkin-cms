# Validation Summary

Validation completed on 2026-06-27.

Results:

| Check | Result |
| --- | --- |
| `result-manifest.json` parse | passed |
| Required package files | passed, 26 of 26 present |
| Extra blocker classification file | present |
| Root report present | passed |
| `dotnet build apps/pumpkin-api/pumpkin-api.csproj -c Release` | passed |
| `dotnet run --project apps/pumpkin-api.Tests/pumpkin-api.Tests.csproj -c Release -- --v2-8-32c` | passed |
| Local no-secret run from final fixed artifact | passed, `/health` and `/api/health` returned `200` |
| Live health after the single I deployment | failed, both approved URLs returned `500` |
| Scoped `git diff --check` | passed; Git emitted line-ending notices for existing CRLF normalization behavior |
| Trailing whitespace scan | passed, 0 matches |
| Secret-like value scan | passed, 0 matches |
| URL/deploy-target scan | passed; URLs were the selected Azure host/health routes plus one pre-existing GitHub metadata URL in source |
| Boundary phrase scan | passed; matches were hard-stop confirmations only |
| Staged files check | passed, no staged files |

Validated files:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api.Tests/PumpkinApiHealthArtifactReadinessTestRunner.cs`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_32I_PUMPKIN_API_RUNTIME_500_HEALTH_RECOVERY_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-32i-pumpkin-api-runtime-500-health-recovery-result/`
