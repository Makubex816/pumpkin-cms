# Decision Log

Generated: 2026-06-04

## Locked Decisions

| Decision | Status | Source |
| --- | --- | --- |
| Ice public site routes are `/`, `/contact`, `/service-areas` | locked for current local proof | local closure docs |
| Local phase is closed | complete | `LOCAL_PHASE_CLOSURE.md` |
| Next local gate is no local repairs needed | complete | `NEXT_LOCAL_BUILD_GATE.md` |
| Production media domain target is `media.iceskatingrinkrentals.com` | planned | production architecture/media planning docs |
| Media URL pattern uses asset ID, checksum, and safe filename | planned | media URL contract |
| Static contact forms need external endpoint in static mode | planned | static form strategy docs |
| Azure Static Web App is planned public static host | planned | production architecture lock |
| Cloudflare handles DNS/CDN/cache | planned | production architecture lock |
| Microsoft 365 remains mailbox provider | planned | production architecture lock |
| Roller remains paused | active constraint | user scope |

## Open Decisions

- exact Azure resource names
- Azure Storage account/container selection
- Cloudflare media hostname setup timing
- exact media upload execution plan
- exact MediaAsset update batch
- exact static form endpoint host
- staging domain choice and timing
- production cutover date
- email sending/notification policy
- production indexing enablement timing

## Current Run Decision

Create a master production-readiness planning package only.

No execution decision was made.

