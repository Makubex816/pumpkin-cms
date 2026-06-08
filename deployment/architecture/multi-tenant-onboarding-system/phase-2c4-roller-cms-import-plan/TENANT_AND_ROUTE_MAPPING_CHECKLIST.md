# Tenant And Route Mapping Checklist

## Tenant Mapping

- [ ] Tenant ID maps to `roller-rink-rentals`.
- [ ] Site key maps to `roller-rink-rentals`.
- [ ] CMS tenant slug maps to `roller-rink-rentals`.
- [ ] Display name maps to Roller Rink Rentals.
- [ ] Business type is reviewed.
- [ ] Tenant API key remains `TENANT_API_KEY_RUNTIME_ONLY`.
- [ ] Paused tenant dry-run approval metadata remains local-only evidence.

## Site Mapping

- [ ] Primary domain is `rollerrinkrentals.com`.
- [ ] `www` domain is `www.rollerrinkrentals.com`.
- [ ] Media domain is `media.rollerrinkrentals.com`.
- [ ] Deployment profile ID is `static-azure-cloudflare-worker-graph`.
- [ ] Canonical host is reviewed.
- [ ] Domain metadata does not authorize DNS, Cloudflare, Azure, deployment, Search Console, or live pages.

## Route Mapping

- [ ] Approved route `/` maps to home page.
- [ ] Approved route `/contact/` maps to contact page.
- [ ] Approved route `/service-areas/` maps to service areas page.
- [ ] Forbidden route `/preview/` remains blocked.
- [ ] Forbidden route `/draft/` remains blocked.
- [ ] Forbidden route `/old-roller-rink-rentals/` remains blocked.
- [ ] Forbidden route `/old/` remains blocked.

## Hard Stop

No route should become publicly live from CMS import planning or future CMS import alone.
