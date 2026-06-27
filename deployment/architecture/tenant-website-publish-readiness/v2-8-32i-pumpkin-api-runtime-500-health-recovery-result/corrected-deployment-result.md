# Corrected Deployment Result

One live deployment attempt was made in V2.8.32I.

Command shape:

`az webapp deploy --resource-group rg-pumpkin-api-prod-centralus --name app-pumpkin-api-prod-centralus-001 --src-path .tmp/v2-8-32i/pumpkin-api-health-recovery-posix.zip --type zip --clean true --restart true`

Result:

| Field | Value |
| --- | --- |
| Deployment id | `fa765264-2b74-4861-aaf4-b627ccf42028` |
| Location | `Central US` |
| Status | `RuntimeSuccessful` |
| Successful instances | `1` |
| Failed instances | `0` |
| In-progress instances | `0` |

Deployment logs showed clean deployment to `/home/site/wwwroot`, site restart, and deployment success.

No second deployment was attempted after the final null-safe JWT fix was proven locally.
