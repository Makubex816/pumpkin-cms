# Starter Preview Route Reproof

Status: passed.

Host:

`https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`

GET-only proof:

| Route | Status | Redirect | Bytes | Result |
| --- | ---: | --- | ---: | --- |
| `/` | 200 | no | 32616 | starter default page served |
| `/admin/login` | 200 | no | 6367 | login page served |
| `/admin` | 307 | `/admin/login` | 12024 | unauthenticated admin redirected |
| `/preview/party-pros-philadelphia` | 200 | no | 32233 | preview home served |
| `/preview/party-pros-philadelphia/contact` | 200 | no | 36505 | preview contact served |
| `/preview/party-pros-philadelphia/service-areas` | 200 | no | 32031 | preview service areas served |

No deploy or redeploy occurred during OK.
