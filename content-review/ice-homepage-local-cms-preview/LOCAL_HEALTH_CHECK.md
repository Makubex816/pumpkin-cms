# Local Health Check

## Listener Status

| Service | Port | Status | Process |
| --- | ---: | --- | --- |
| Pumpkin API | 5064 | listening | `pumpkin-api` |
| Admin app | 3000 | listening | `node` |
| Admin alternate | 3001 | no listener | n/a |
| Ice public frontend | 3002 | listening | `node` |
| Static form endpoint | 7072 | no listener | n/a |

## Safe HTTP Checks

| Target | URL | Method | Status | Result |
| --- | --- | --- | ---: | --- |
| Pumpkin API root | `http://localhost:5064/` | GET | 200 | responded |
| Admin app root | `http://localhost:3000/` | GET | 200 | title: `Pumpkin CMS Admin` |
| Ice public home | `http://localhost:3002/` | GET | 200 | title: `Portable Ice Rink Rentals for Events` |
| Ice public contact | `http://localhost:3002/contact` | GET | 200 | title: `Request an Ice Rink Rental Quote | Ice Skating Rink Rentals | Ice Skating Rink Rentals` |
| Ice public service areas | `http://localhost:3002/service-areas` | GET | 404 | no current route/fallback rendered |
| Static form endpoint | `http://localhost:7072/api/contact` | GET | n/a | no listener |

## Start Commands

Pumpkin API:

```powershell
cd apps/pumpkin-api
dotnet run
```

Admin app:

```powershell
cd apps/admin
npm run dev
```

Ice public frontend:

```powershell
cd apps/ice-rink-web
npm run dev
```

Static form endpoint, optional dry-run only:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

No login, form submission, authenticated CMS write, MediaAsset upload, email sending, deployment, DNS change, or protected config access was performed.

