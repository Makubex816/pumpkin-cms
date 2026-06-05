# Tooling Change Result

Changed file:

```text
apps/ice-rink-web/scripts/snapshot-cms-content.mjs
```

Change:

- added a site-scoped public snapshot sanitizer for `ice-rink-rentals`
- removed only `revision.latestSnapshot` from page JSON before writing `.static-content-snapshots/ice-rink-rentals/pages/*.json`
- left active page content, media, SEO/meta fields, route filtering, theme snapshot behavior, and validation gates intact

Safety properties:

- no CMS write path was added or used
- no page/body data was edited in CMS
- no MediaAsset writes occurred
- no Cloudflare or Azure changes occurred
- validators still scan all public output and will still catch active local media URLs if they appear later

Syntax check:

```text
node --check apps/ice-rink-web/scripts/snapshot-cms-content.mjs
exit 0
```

