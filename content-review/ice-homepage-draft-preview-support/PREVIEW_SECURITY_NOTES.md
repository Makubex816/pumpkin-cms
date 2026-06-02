# Preview Security Notes

- Preview is unavailable when PUMPKIN_RENDER_MODE=static.
- Preview is unavailable in production unless PUMPKIN_DRAFT_PREVIEW_ENABLED=true or NEXT_PUBLIC_PUMPKIN_DRAFT_PREVIEW_ENABLED=true is explicitly set.
- The preview page declares noindex/nofollow/nocache metadata.
- The preview URL is not sourced from sitemap generation.
- The public / route continues to call the published/public page path and was not modified.
- The preview client requires a local admin JWT pasted at runtime or stored in browser sessionStorage; no token is committed or printed.
- The token input uses type=password and stores only in sessionStorage under pumpkin_ice_homepage_preview_jwt until cleared.
- Preview rendering passes renderMode=static with no staticFormEndpoint so form submission is inert and does not create FormEntry records from preview clicks.
- Media proxy is path-scoped to /media/ice-rink-rentals/:path* and is disabled in static mode and production unless PUMPKIN_MEDIA_PROXY_ENABLED=true.

## Production And Static Behavior

The preview page calls notFound() when static render mode is active. In production, it is unavailable unless explicitly enabled through a preview flag. The preview route is not included in sitemap output.

## JWT Handling

No JWT values are stored in source files, committed docs, or logs. The preview page accepts a local admin JWT at runtime and stores it only in browser sessionStorage until the reviewer clears it.

## Protected Config Note

No protected config file was directly opened, read, modified, copied, or printed by Codex. A temporary Next dev server used for validation reported that it detected .env.local during startup, but no values were exposed. The temporary server was stopped and its temporary logs were removed.
