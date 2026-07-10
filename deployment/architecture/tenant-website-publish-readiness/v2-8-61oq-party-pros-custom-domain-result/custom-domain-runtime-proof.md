# Custom Domain Runtime Proof

Status: passed for HTTP, skipped for HTTPS because TLS is not active.

Default starter host:

| URL | Status | Result |
| --- | ---: | --- |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/` | 200 | pass |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/admin/login` | 200 | pass |
| `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net/admin` | 307 | pass, redirects to login |

Custom-domain HTTP proof:

| URL | Status | Party Pros marker | Host tenant marker |
| --- | ---: | --- | --- |
| `http://partyrentalphiladelphia.com/` | 200 | yes | yes |
| `http://www.partyrentalphiladelphia.com/` | 200 | yes | yes |
| `http://partyrentalphiladelphia.com/contact` | 200 | yes | yes |
| `http://www.partyrentalphiladelphia.com/contact` | 200 | yes | yes |
| `http://partyrentalphiladelphia.com/service-areas` | 200 | yes | yes |
| `http://www.partyrentalphiladelphia.com/service-areas` | 200 | yes | yes |

Custom-domain HTTPS proof:

- Skipped because managed TLS was not bound and App Service readback showed `sslState=Disabled`.
