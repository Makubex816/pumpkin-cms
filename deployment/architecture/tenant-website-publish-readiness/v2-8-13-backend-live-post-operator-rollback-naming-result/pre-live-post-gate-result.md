# Pre Live POST Gate Result

Status: passed.

Gates checked before POST:

| Gate | Result |
| --- | --- |
| Endpoint exact match | passed |
| Approved endpoint | `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` |
| Origin | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| Payload local validation | passed |
| Operator named | `PumpkinCMS operator` |
| Rollback owner named | `PumpkinCMS operator` |
| Protected config required | no |
| Auth header required | no |
| Secret/token/key/SAS required | no |
| Deployment/DNS/indexing/publication attempted | no |
| Preflight `OPTIONS` status | `204` |
| Preflight CORS result | allowed origin and `OPTIONS, POST` methods |

The initial local preflight helper used Bash-style heredocs in PowerShell and failed before Node ran. No HTTP request was sent by that failed helper. The corrected preflight passed before the single approved POST.

