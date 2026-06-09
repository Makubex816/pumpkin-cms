# CMS/API Metadata Discovery Result

## Env Availability

- `PUMPKIN_API_URL`: PRESENT
- `PUMPKIN_ADMIN_JWT`: PRESENT

Values were not printed.

## Sanitized GET Checks

| Check | Result |
| --- | --- |
| API root GET | `200`, body suppressed |
| `/api/auth/verify` GET with bearer JWT | `401`, body suppressed |

## Endpoint Safety Review

No dedicated safe non-secret provider metadata endpoint was found in `apps/pumpkin-api/Program.cs`.

Admin tenant endpoints were not used for raw metadata discovery because the tenant model includes API-key fields. Page, media, route, form, and tenant payloads were not printed.

## Interpretation

The CMS/API is reachable, but the current session did not produce authenticated provider metadata. The API surface does not currently offer a safe provider/source discovery endpoint, so CMS/API metadata cannot identify the live database provider in this phase.
