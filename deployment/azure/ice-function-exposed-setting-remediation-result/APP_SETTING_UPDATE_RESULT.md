# App Setting Update Result

Generated: 2026-06-06

## Result

The three approved Function App storage settings were updated to use `key2`.

Updated setting names:

- `AzureWebJobsStorage`
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
- `AzureWebJobsDashboard`

## Post-Update Verification Before Rotation

| Setting name | Value present | Matched key name |
| --- | --- | --- |
| `AzureWebJobsStorage` | yes | `key2` |
| `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` | yes | `key2` |
| `AzureWebJobsDashboard` | yes | `key2` |

| Check | Result |
| --- | --- |
| all target settings on `key2` | yes |
| dry-run/no-email confirmed | yes |
| Graph mode active | no |
| Graph-related setting name count | 0 |
| explicit Function restart command run | no |

No other app setting changes were intentionally performed.

