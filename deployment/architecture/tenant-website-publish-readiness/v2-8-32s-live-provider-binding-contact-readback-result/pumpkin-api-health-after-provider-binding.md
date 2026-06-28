# Pumpkin API Health After Provider Binding

Health check status: failed V2.8.32S provider readiness gate.

After appsetting mutation and Web App restart:

| Endpoint | HTTP status | `providerConfigured` | `providerStatus` |
| --- | ---: | --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 200 | false | `not_checked` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 200 | false | `not_checked` |

Interpretation:

The API process is live, but the public health response still exposes `providerConfigured:false`. The approved V2.8.32S rule says to stop before login if that field remains false.

Classification: `provider_binding_not_active`.

