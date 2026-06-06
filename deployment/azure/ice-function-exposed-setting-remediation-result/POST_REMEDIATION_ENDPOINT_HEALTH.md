# Post-Remediation Endpoint Health

Generated: 2026-06-06

## After Setting Update, Before Key Rotation

| Test | Expected | Actual | Passed |
| --- | --- | --- | --- |
| OPTIONS/CORS | 204 | 204 | yes |
| valid frontend-style dry-run payload | 200 | 200 | yes |
| invalid email | 400 | 400 | yes |
| unknown routing/recipient | 400 | 400 | yes |
| honeypot | 400 | 400 | yes |
| response secret-pattern scan | clean | clean | yes |

## After Key Rotation

| Test | Expected | Actual | Passed |
| --- | --- | --- | --- |
| OPTIONS/CORS | 204 | 204 | yes |
| valid frontend-style dry-run payload | 200 | 200 | yes |
| invalid email | 400 | 400 | yes |
| unknown routing/recipient | 400 | 400 | yes |
| honeypot | 400 | 400 | yes |
| response secret-pattern scan | clean | clean | yes |

## Final Runtime State

| Check | Result |
| --- | --- |
| Function App state | `Running` |
| settings still match `key2` | yes |
| dry-run/no-email mode confirmed | yes |
| Graph mode active | no |
| Graph-related setting name count | 0 |

No real email was sent.

