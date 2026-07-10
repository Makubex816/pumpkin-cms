# HTTPS Media Prerecheck

Custom HTTPS routes were checked before the controlled form submission.

| Route | Status | Images | Expected | Media markers |
| --- | ---: | ---: | ---: | ---: |
| `https://partyrentalphiladelphia.com/` | 200 | 9 | 9 | 117 |
| `https://partyrentalphiladelphia.com/contact` | 200 | 6 | 6 | 83 |
| `https://partyrentalphiladelphia.com/service-areas` | 200 | 6 | 6 | 78 |
| `https://www.partyrentalphiladelphia.com/` | 200 | 9 | 9 | 117 |
| `https://www.partyrentalphiladelphia.com/contact` | 200 | 6 | 6 | 83 |
| `https://www.partyrentalphiladelphia.com/service-areas` | 200 | 6 | 6 | 78 |

Final no-regression later rechecked the same routes and all returned HTTP 200.

