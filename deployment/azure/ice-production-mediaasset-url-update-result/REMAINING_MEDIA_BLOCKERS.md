# Remaining Media Blockers

Date: 2026-06-05

## Resolved

The approved 9 Ice MediaAsset records now point to validated `media.iceskatingrinkrentals.com` production URLs in their MediaAsset URL fields.

A later separately approved active page body/media repair also cleared local media URLs from active root `ContentData` and root `media` fields on `home`, `contact`, and `service-areas`.

```text
MediaAsset production URL readiness: yes
Cloudflare public media URL validation: yes
Azure direct public Blob media readable: yes
Active page body media URL readiness: yes
```

## Still Blocked

Media production URL readiness remains `no` for static output because `revision.latestSnapshot` rollback payloads still contain local `/media/ice-rink-rentals/...` URLs and are serialized into generated HTML/TXT output.

Strict validators still report local media URL errors in:

- `index.html`
- `index.txt`
- `contact/index.html`
- `contact/index.txt`
- `service-areas/index.html`
- `service-areas/index.txt`

The remaining local media strings are no longer in active root `ContentData` or root `media` fields and no rendered `<img>` tag uses a local `/media` URL. Updating the remaining rollback snapshot payloads would require separately approved stale revision/rollback snapshot work or an approved export-payload filtering path.

## Other Readiness Blockers

- static form endpoint production readiness remains `no`
- Azure staging readiness remains `no`
- DNS cutover readiness remains `no`
- production/indexing readiness remains not live-ready
- Roller remains paused

Do not mark full media production URL readiness yes until the stale revision/export-payload media blocker is separately approved and cleared, and the strict static/staging validators pass.
