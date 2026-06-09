# Read-Only Preflight Scope

## Approved Phase 2C-6 Scope

- Check environment variable presence without printing values.
- Revalidate the local Roller import package using offline tools.
- Use approved CMS/API GET or HEAD current-state checks only if required environment variables are present.
- Identify possible existing Roller tenant, site, route, slug, domain, and form-recipient conflicts if read-only checks can run.
- Document results and recommend whether later CMS import execution approval can be considered.

## Current Execution Boundary

| Boundary | Status |
| --- | --- |
| CMS writes | not performed |
| Tenant creation | not performed |
| MediaAsset writes | not performed |
| POST/PUT/PATCH/DELETE requests | not performed |
| CMS GET/HEAD requests | not performed, blocked by missing `PUMPKIN_API_URL` |
| Protected config reads | not performed |
| Secret printing | not performed |
| External mutations | not performed |
| Live-page publication | not performed |

## Candidate Tenant

| Field | Value |
| --- | --- |
| Tenant display name | Roller Rink Rentals |
| Tenant key | `roller-rink-rentals` |
| Primary domain | `rollerrinkrentals.com` |
| WWW domain | `www.rollerrinkrentals.com` |
| Media domain | `media.rollerrinkrentals.com` |
| Approved routes | `/`, `/contact`, `/service-areas` |
| Forbidden routes | `/preview`, `/draft`, `/old-roller-rink-rentals` |
| Contact form recipient ref | `roller-rink-leads` |

## Scope Result

The local/offline portion of the preflight completed. The CMS/API current-state portion did not run because the current shell did not provide an API target.
