# Post-Deploy Staging Route Check Result

Status: passed.

Only the three approved isolated staging routes were checked. Each check was a direct GET request. No crawl, outbound link follow, form submission, production-domain check, indexing trigger, or POST occurred.

| Route | Method | Status | Content type | Content length |
| --- | --- | --- | --- | --- |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/` | GET | `200 OK` | `text/html` | `43788` |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/service-areas` | GET | `200 OK` | `text/html` | `46655` |
| `https://kind-island-0a85a740f.7.azurestaticapps.net/contact` | GET | `200 OK` | `text/html` | `50054` |

Classification:

```text
staging_publish_executed_and_verified
```
