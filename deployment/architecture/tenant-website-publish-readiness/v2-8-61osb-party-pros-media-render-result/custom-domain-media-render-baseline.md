# Custom-Domain Media Render Baseline

Baseline method: GET-only HTML readback before OSB repair.

| Route group | HTTP 200 | Image tags | Blob refs | Bad local/package refs | Party Pros markers |
| --- | ---: | ---: | ---: | ---: | --- |
| Apex `/`, `/contact`, `/service-areas` | 3/3 | 0 | 0 | 0 | yes |
| WWW `/`, `/contact`, `/service-areas` | 3/3 | 0 | 0 | 0 | yes |
| Starter preview `/preview/party-pros-philadelphia...` | 3/3 | 0 | 0 | 0 | yes |

Baseline classification:

- HTTPS custom-domain routing worked.
- Party Pros text content rendered.
- Image/media references were absent from HTML.
- No `file://`, Windows path, `/public/...`, `party-pros-frontend`, or tenant package path refs were present.

This baseline pointed to fixture/page media omission rather than broken rendered image URLs.
