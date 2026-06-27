# Fixed Deployment Result

One deployment attempt was made in V2.8.32J.

Command shape:

`az webapp deploy --resource-group rg-pumpkin-api-prod-centralus --name app-pumpkin-api-prod-centralus-001 --src-path .tmp/v2-8-32i/pumpkin-api-health-recovery-local-fixed-posix.zip --type zip --clean true --restart true`

Result:

| Field | Value |
| --- | --- |
| Deployment id | `e224d49c-4db7-40ca-b0e1-f6bffedbf8ab` |
| Location | `Central US` |
| Status | `RuntimeSuccessful` |
| Successful instances | `1` |
| Failed instances | `0` |
| In-progress instances | `0` |

No second deployment attempt occurred.
