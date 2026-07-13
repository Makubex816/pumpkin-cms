# Tenant Isolation Reproof

All fourteen Ice, Party Pros, and platform-level denial probes returned HTTP 401 or 403.

| Probe | HTTP | Result |
| --- | ---: | --- |
| ice-rink-rentals:pages | 403 | denied |
| ice-rink-rentals:forms | 403 | denied |
| ice-rink-rentals:media | 403 | denied |
| ice-rink-rentals:redirects | 403 | denied |
| ice-rink-rentals:domains | 403 | denied |
| party-pros-philadelphia:pages | 403 | denied |
| party-pros-philadelphia:forms | 403 | denied |
| party-pros-philadelphia:media | 403 | denied |
| party-pros-philadelphia:redirects | 403 | denied |
| party-pros-philadelphia:domains | 403 | denied |
| globalUsers | 403 | denied |
| platformDomains | 403 | denied |
| directIceTenant | 403 | denied |
| directPartyProsTenant | 403 | denied |

Ice content/config counts and eight non-auth digests match the committed baseline. The Ice user digest is intentionally excluded because SuperAdmin authentication updates the Ice-scoped SuperAdmin `lastLogin`; the user count remained 2, matching the committed DRU accounting rule.

Party Pros counts and all nine compared digests match exactly. Airstrip was not addressed through a tenant-scoped or runtime request. Global tenant-list evidence stayed 4 before/after, with one Airstrip identity and an unchanged safe identity digest.
