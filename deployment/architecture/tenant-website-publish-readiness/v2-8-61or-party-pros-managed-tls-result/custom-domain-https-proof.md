# Custom Domain HTTPS Proof

Status: passed.

Final custom HTTPS route proof:

| URL | Status | Party Pros marker | Host tenant marker |
| --- | ---: | --- | --- |
| `https://partyrentalphiladelphia.com/` | 200 | yes | yes |
| `https://partyrentalphiladelphia.com/contact` | 200 | yes | yes |
| `https://partyrentalphiladelphia.com/service-areas` | 200 | yes | yes |
| `https://www.partyrentalphiladelphia.com/` | 200 | yes | yes |
| `https://www.partyrentalphiladelphia.com/contact` | 200 | yes | yes |
| `https://www.partyrentalphiladelphia.com/service-areas` | 200 | yes | yes |

Independent clean `curl -sS -I` proof returned `HTTP/1.1 200 OK` for all six HTTPS routes before HTTPS-only was enabled.
