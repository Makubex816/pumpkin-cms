# Pumpkin API Health After Login Repair

Health checks after JWT support repair and Web App restart:

| Route | HTTP status | `providerConfigured` |
| --- | ---: | --- |
| `/health` | 200 | false |
| `/api/health` | 200 | false |

Interpretation:

The HTTP health routes are live. The `providerConfigured:false` value remains the known hardcoded source health field from earlier phases and was not treated as a provider-binding failure in V2.8.32W.
