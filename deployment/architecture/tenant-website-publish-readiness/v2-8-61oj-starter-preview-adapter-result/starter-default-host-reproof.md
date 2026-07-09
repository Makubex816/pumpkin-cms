# Starter Default Host Reproof

Status: passed.

Host:

`https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`

Readback routes:

| Route | Status | Bytes | Result |
| --- | ---: | ---: | --- |
| `/` | 200 | 32616 | starter default page served |
| `/admin/login` | 200 | 6367 | login page served |
| `/admin` | 307 | 12024 | redirected to `/admin/login` |

Name-only appsetting readback remained unchanged:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `NEXT_TELEMETRY_DISABLED`
- `PORT`
- `PUMPKIN_API_URL`
- `PUMPKIN_SITE_NAME`
- `WEBSITES_PORT`

No appsetting values were printed.
