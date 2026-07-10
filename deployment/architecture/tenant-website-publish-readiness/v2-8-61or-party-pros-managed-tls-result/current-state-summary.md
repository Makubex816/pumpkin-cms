# Current State Summary

Status: complete.

Current live state:

| Item | State |
| --- | --- |
| App Service | `app-pumpkin-starter-preview-centralus-001` |
| `partyrentalphiladelphia.com` hostname | bound |
| `www.partyrentalphiladelphia.com` hostname | bound |
| `partyrentalphiladelphia.com` SSL | `SniEnabled` |
| `www.partyrentalphiladelphia.com` SSL | `SniEnabled` |
| HTTPS-only | `true` |
| Custom HTTPS routes | 200 |
| Custom HTTP routes | 301 to HTTPS |
| Forms | disabled/no-post |

Final App Service readback:

- `partyrentalphiladelphia.com`: `sslState=SniEnabled`, thumbprint `CF1195799725228D4A756311236C114CABE337E3`.
- `www.partyrentalphiladelphia.com`: `sslState=SniEnabled`, thumbprint `228732A6AFB094A99BE9128824445EB82174841E`.
- `httpsOnly=true`.
