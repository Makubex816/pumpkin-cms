# Custom-Host Routing Audit

The shared implementation in `apps/starter-app/src/lib/host-tenant-routing.ts` is tenant-generic and normalizes committed or environment-provided host mappings. The committed registry contains one Party Pros mapping and no Vegas mapping.

Local GET proof against committed source:

| Host / route | HTTP | Tenant result |
| --- | ---: | --- |
| Vegas apex `/` | 200 | generic Pumpkin fallback, no tenant marker |
| Vegas WWW `/` | 200 | generic Pumpkin fallback, no tenant marker |
| Vegas `/clubs/crazy-horse-3` | 404 | no tenant marker |
| Vegas `/guides/dress-code` | 404 | no tenant marker |
| Vegas `/contact` | 404 | no tenant marker |
| Party Pros apex `/` | 200 | `party-pros-philadelphia`, `live-submit` |

Routing is not ready for Vegas. Party Pros remains unchanged.
