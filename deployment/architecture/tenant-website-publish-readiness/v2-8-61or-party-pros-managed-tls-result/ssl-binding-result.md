# SSL Binding Result

Status: passed.

SNI SSL bindings were applied to the existing App Service:

| Hostname | SSL state | Thumbprint |
| --- | --- | --- |
| `partyrentalphiladelphia.com` | `SniEnabled` | `CF1195799725228D4A756311236C114CABE337E3` |
| `www.partyrentalphiladelphia.com` | `SniEnabled` | `228732A6AFB094A99BE9128824445EB82174841E` |

Post-bind note:

- One immediate apex root proof saw a transient client trust/principal failure.
- A subsequent clean `curl -sS -I` matrix and full GET proof passed for all six HTTPS custom routes.
- No further mutation was performed until the clean HTTPS proof and default-host proof passed.
