# DNS And Hostname Prerecheck

Status: passed.

Public DNS readback from `1.1.1.1`, `8.8.8.8`, and `9.9.9.9` matched OQ:

| Record | Value |
| --- | --- |
| NS | `ns1-03.azure-dns.com`, `ns2-03.azure-dns.net`, `ns3-03.azure-dns.org`, `ns4-03.azure-dns.info` |
| Apex A | `20.118.48.17` |
| `www` CNAME | `app-pumpkin-starter-preview-centralus-001.azurewebsites.net` |
| `asuid` TXT | present |
| `asuid.www` TXT | present |

App Service hostname binding prerecheck:

- `partyrentalphiladelphia.com`: `hostNameType=Verified`.
- `www.partyrentalphiladelphia.com`: `hostNameType=Verified`.

Initial SSL prerecheck:

- Both custom hostnames were bound, but `sslState` was not enabled before OR binding.
- Certificate inventory through `az webapp config ssl list` did not surface the managed certs, so OR read exact `Microsoft.Web/certificates` resources directly after Azure reported duplicates.
