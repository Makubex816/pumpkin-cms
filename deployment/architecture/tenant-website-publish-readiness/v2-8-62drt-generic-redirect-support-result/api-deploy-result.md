# API Deploy Result

Exactly one approved API deployment was attempted.

| Item | Result |
| --- | --- |
| Command type | `az webapp deploy` / OneDeploy ZIP |
| Resource group | `rg-pumpkin-api-prod-centralus` |
| App Service | `app-pumpkin-api-prod-centralus-001` |
| ZIP options | `--type zip --clean true --restart true` |
| Attempt count | `1/1` |
| Exit code | 0 |
| Deployment ID | `0facfa2a-b9fd-4a98-9597-528219c84f00` |
| Status | `RuntimeSuccessful` |
| Successful / failed instances | 1 / 0 |
| Azure-reported errors | 0 |

The deployment activated the new routes. A post-deploy semantic defect was then found in live Linux validation. No second deployment or retry was attempted because DRT authorized only one API deploy.

No starter, Admin, Ice, Party Pros, or Airstrip deployment occurred.
