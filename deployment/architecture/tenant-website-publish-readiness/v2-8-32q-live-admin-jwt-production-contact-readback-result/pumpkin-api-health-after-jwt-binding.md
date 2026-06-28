# Pumpkin API Health After JWT Binding

Health check timestamp: `2026-06-27T22:54:03.3544606-04:00`.

| URL | Attempts | Status | OK | Public-safe summary |
| --- | ---: | ---: | --- | --- |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health` | 1 | `200` | yes | `ok:True; service:pumpkin-api; environment:Production; providerConfigured:False; providerStatus:not_checked` |
| `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health` | 1 | `200` | yes | `ok:True; service:pumpkin-api; environment:Production; providerConfigured:False; providerStatus:not_checked` |

Pumpkin API health after JWT binding: passed.

Note:

An initial PowerShell `Invoke-WebRequest` probe produced a local `NullReferenceException`; the same approved URLs were immediately rechecked with .NET `HttpClient` and returned HTTP `200`.

