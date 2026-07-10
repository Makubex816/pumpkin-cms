# Current State Summary

Status: `partial_success_tls_not_bound`.

Live Party Pros domain state:

| Item | State |
| --- | --- |
| Azure DNS zone | exists: `partyrentalphiladelphia.com` |
| Public nameservers | Azure NS fully propagated |
| Starter App Service | `app-pumpkin-starter-preview-centralus-001` |
| Custom hostname `partyrentalphiladelphia.com` | bound |
| Custom hostname `www.partyrentalphiladelphia.com` | bound |
| HTTP custom-domain routes | 200 and Party Pros content |
| Managed TLS | not bound |
| HTTPS-only | false |
| Custom-domain HTTPS proof | skipped because TLS is not active |
| Forms | rendered disabled/no-post |

App Service hostname readback after OQ:

- `partyrentalphiladelphia.com`: `hostNameType=Verified`, `sslState=Disabled`, `thumbprint=null`.
- `www.partyrentalphiladelphia.com`: `hostNameType=Verified`, `sslState=Disabled`, `thumbprint=null`.
- `httpsOnly=false`.
