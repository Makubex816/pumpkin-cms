# HTTPS And Media Prerecheck

GET-only custom-domain prerecheck passed.

| Route | Status | Images | Blob refs | Forms | POST methods | Disabled marker | Bad refs |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| `https://partyrentalphiladelphia.com/` | 200 | 9 | 33 | 0 | 0 | yes | 0 |
| `https://partyrentalphiladelphia.com/contact` | 200 | 6 | 21 | 1 | 0 | yes | 0 |
| `https://partyrentalphiladelphia.com/service-areas` | 200 | 6 | 21 | 0 | 0 | yes | 0 |
| `https://www.partyrentalphiladelphia.com/` | 200 | 9 | 33 | 0 | 0 | yes | 0 |
| `https://www.partyrentalphiladelphia.com/contact` | 200 | 6 | 21 | 1 | 0 | yes | 0 |
| `https://www.partyrentalphiladelphia.com/service-areas` | 200 | 6 | 21 | 0 | 0 | yes | 0 |

Conclusion: HTTPS and media rendering are healthy. OSC stopped later on auth/key acceptance before form submission.
