# Ice Function Exposed Setting Remediation Preflight

Generated: 2026-06-06

## Result

Preflight complete.

The exposed storage connection setting names are documented by name only. `AzureWebJobsStorage` is present, so the exposure includes the Azure Functions runtime storage connection setting. The related storage connection setting names `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` and `AzureWebJobsDashboard` are also present and should be remediated in the same controlled execution.

No values were printed in this package. No storage keys were listed. No key rotation or app setting changes were performed.

## Resources

| Field | Value |
| --- | --- |
| Function App | `func-ice-static-contact-20260605` |
| Resource group | `rg-ice-static-form-endpoint` |
| Endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Storage account | `iceforms20260605` |
| Function observed | `static-contact` |

## Package Files

- `EXPOSURE_SUMMARY.md`
- `FUNCTION_APP_SETTING_NAME_AUDIT.md`
- `STORAGE_ACCOUNT_METADATA_CHECK.md`
- `REMEDIATION_OPTIONS.md`
- `RECOMMENDED_REMEDIATION_PATH.md`
- `SAFE_ROTATION_EXECUTION_PLAN.md`
- `VERIFICATION_PLAN.md`
- `ROLLBACK_PLAN.md`
- `APPROVAL_REQUIRED_BEFORE_ROTATION.md`
- `manifest.json`

