# Cloudflare and Domain Resource Inventory Plan

The registry should track domains, DNS, zones, workers, routes, and publication status.

## Resource Types

- Domain
- Media domain
- DNS record
- Cloudflare zone
- Cloudflare worker
- Cloudflare route
- SSL/TLS setting reference
- Indexing/Search Console status reference

## Fields

- Domain name
- Tenant/site mapping
- DNS provider
- Zone reference
- Record type/name/value redaction category
- Runtime/profile references
- Credential references
- Publication status
- Indexing status
- Cutover approval status

## Rules

- No DNS changes are approved by registry planning.
- No Cloudflare API calls are approved by registry planning.
- Search Console/indexing remains a final separate approval gate.
- Live-page publication remains hard-stopped.

