# Start Commands

Run each service in its own terminal.

## 1. Pumpkin API

```powershell
cd apps/pumpkin-api
dotnet run
```

Expected:

- URL: `http://localhost:5064`
- Safe check: open `http://localhost:5064/`

Do not print or commit local database connection strings, JWT secrets, API keys, or protected config.

## 2. Admin App

```powershell
cd apps/admin
npm install
npm run dev
```

Expected:

- URL: `http://localhost:3000`
- Safe check: open `http://localhost:3000/`

Login is outside this readiness package.

## 3. Ice Public App

```powershell
cd apps/ice-rink-web
npm install
npm run dev
```

Expected:

- URL: `http://localhost:3002`
- Ice routes:
  - `http://localhost:3002/`
  - `http://localhost:3002/contact`
  - `http://localhost:3002/service-areas`

If secure local tenant API variables are not available, the app can still render fallback Ice pages for routes that have fallback content.

## 4. Static Form Endpoint In Dry Run

```powershell
cd deployment/static-azure/forms/static-form-endpoint
$env:STATIC_FORM_FORWARD_MODE='dry-run'
npm run start:local
```

Expected:

- URL: `http://localhost:7072/api/contact`
- Functional form testing requires a POST and was not run in this package.

## Port Summary

| Service | Port | URL |
| --- | ---: | --- |
| Pumpkin API | 5064 | `http://localhost:5064` |
| Admin app | 3000 | `http://localhost:3000` |
| Ice public app | 3002 | `http://localhost:3002` |
| Static form endpoint | 7072 | `http://localhost:7072/api/contact` |

