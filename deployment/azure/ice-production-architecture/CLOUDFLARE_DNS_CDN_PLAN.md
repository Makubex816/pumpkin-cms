# Cloudflare DNS CDN Plan

Cloudflare handles DNS, CDN, and cache behavior for website and media domains.

Website:

```text
iceskatingrinkrentals.com
  -> Cloudflare DNS/CDN/cache
  -> Azure Static Web App
```

Media:

```text
media.iceskatingrinkrentals.com
  -> Cloudflare CDN/cache
  -> Azure Blob Storage
```

Cloudflare media cache plan:

- Cache image assets under `media.iceskatingrinkrentals.com/*`.
- Use cache rules for media asset paths.
- Prefer checksum-versioned immutable media URLs so purge is normally unnecessary.
- Document emergency purge path for production incidents.

Cutover requirements:

- Azure staging must be reviewed before custom domain/DNS cutover.
- DNS and Cloudflare changes require separate explicit approval.
- Microsoft 365 mail records must remain protected during website cutover.
- No Cloudflare DNS/CDN changes were made by this package.
