# Managed Certificate Create Result

Status: existing issued certificates found.

OR made one managed certificate create/retry call per hostname.

| Hostname | Create result | Certificate resource |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | Azure returned duplicate certificate conflict | `Microsoft.Web/certificates/partyrentalphiladelphia.com` |
| `www.partyrentalphiladelphia.com` | Azure returned duplicate certificate conflict | `Microsoft.Web/certificates/www.partyrentalphiladelphia.com` |

Azure duplicate conflict meant the OQ managed-certificate attempt had created or completed certificate resources. Direct resource readback showed both were issued:

| Hostname | Subject | Issuer | Issue date | Expiration | Thumbprint |
| --- | --- | --- | --- | --- | --- |
| `partyrentalphiladelphia.com` | `partyrentalphiladelphia.com` | `GeoTrust TLS RSA CA G1` | `2026-07-10T00:00:00+00:00` | `2027-01-10T23:59:59+00:00` | `CF1195799725228D4A756311236C114CABE337E3` |
| `www.partyrentalphiladelphia.com` | `www.partyrentalphiladelphia.com` | `GeoTrust TLS RSA CA G1` | `2026-07-10T00:00:00+00:00` | `2027-01-10T23:59:59+00:00` | `228732A6AFB094A99BE9128824445EB82174841E` |

No external certificate upload or Key Vault certificate action occurred.
