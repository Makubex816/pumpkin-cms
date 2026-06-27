# Corrected Deployment Result

One corrected deployment attempt was made in H.

Command shape:

`az webapp deploy --resource-group rg-pumpkin-api-prod-centralus --name app-pumpkin-api-prod-centralus-001 --src-path .tmp/v2-8-32h/pumpkin-api-posix.zip --type zip --clean true --restart true`

Result:

| Field | Value |
| --- | --- |
| Deployment id | `09a22446-d448-4cea-b77f-fb7dc256af9b` |
| Location | `Central US` |
| Status | `RuntimeSuccessful` |
| Successful instances | `1` |
| Failed instances | `0` |
| In-progress instances | `0` |

Azure CLI warning noted that Linux Web App deploy does not run build automation by default. This was acceptable because the artifact was pre-built publish output.
