# Runtime No-Regression Proof

GET-only runtime proof passed. No contact POST was sent.

| Surface | Route | Status |
| --- | --- | ---: |
| Apex | `/` | 200 |
| Apex | `/contact` | 200 |
| Apex | `/service-areas` | 200 |
| Apex | `/api/static-contact-health` | 200 |
| WWW | `/` | 200 |
| WWW | `/contact` | 200 |
| WWW | `/service-areas` | 200 |
| WWW | `/api/static-contact-health` | 200 |
| Isolated static host | `/api/static-contact-health` | 200 |
| Pumpkin API | `/health` | 200 |
| Pumpkin API | `/api/health` | 200 |
| Admin UI production | `/` | 200 |
| Admin UI production | `/login` | 200 |
| Admin UI production | `/dashboard` | 200 |
| Admin UI production | `/dashboard/themes` | 200 |
| Admin UI production | `/dashboard/form-builder` | 200 |

Prohibited runtime actions remained false:

- Contact POST sent: false.
- Form submission sent: false.
- Deploy performed: false.
- DNS/indexing performed: false.
- Appsetting mutation performed: false.

