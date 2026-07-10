# Default Host And Preview Reproof

Status: passed.

Default starter host:

| URL | Status | Result |
| --- | ---: | --- |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/` | 200 | pass |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/admin/login` | 200 | pass |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/admin` | 307 | pass, redirects to login |

Party Pros preview routes:

| URL | Status | Party Pros marker |
| --- | ---: | --- |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia` | 200 | yes |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia/contact` | 200 | yes |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/preview/party-pros-philadelphia/service-areas` | 200 | yes |
