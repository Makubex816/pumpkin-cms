# Public Runtime Capability Coverage

| Surface | V2.8.52 Status | Notes |
| --- | ---: | --- |
| Apex `/` | 200 | Ice public site live. |
| Apex `/contact` | 200 | Contact page live. |
| Apex `/service-areas` | 200 | Service areas live. |
| Apex `/api/static-contact-health` | 200 | Health body reports `ok: true`. |
| Www `/` | 200 | Ice public site live. |
| Www `/contact` | 200 | Contact page live. |
| Www `/service-areas` | 200 | Service areas live. |
| Www `/api/static-contact-health` | 200 | Health body reports `ok: true`. |
| Isolated `/api/static-contact-health` | 200 | Isolated managed API health recovered. |
| Pumpkin API `/health` | 200 | Body still reports `providerConfigured:false`, known nonblocking health detail. |
| Pumpkin API `/api/health` | 200 | Body still reports `providerConfigured:false`, known nonblocking health detail. |
| Admin UI production `/` | 200 | Production host serves app. |
| Admin UI production `/login` | 200 | Login route live. |
| Admin UI production `/dashboard` | 200 | Dashboard shell route live. |
