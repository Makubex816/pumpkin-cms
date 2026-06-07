# Profile: static-azure-cloudflare-cdn

Static Next export hosted on Azure with Cloudflare CDN/cache behavior for media or full-site acceleration.

Expected components:

- Pumpkin CMS
- static Next export
- Azure Static Web Apps or static hosting
- Cloudflare DNS/CDN
- profile-managed media delivery
- optional form endpoint

This profile needs validators for cache rules, canonical hosts, media URL behavior, form behavior if enabled, and rollback that separates DNS rollback from cache/CDN rollback.

