# Remaining Media Blockers

## Resolved In This Run

Active page body/media root URL readiness is now `yes`.

```text
active ContentData local media URLs: 0
active media local media URLs: 0
rendered local img tags: 0
```

## Resolved By Later Static Revision Payload Cleanup

Full media production URL readiness is now `yes`.

The page API stores a rollback snapshot under `revision.latestSnapshot.page`. After the approved active-root repair, that snapshot intentionally contained the pre-repair page state. At the time of this repair, static export serialized that revision snapshot into the generated page payloads, so strict validators still found local `/media/ice-rink-rentals/...` strings in:

- `index.html`
- `index.txt`
- `contact/index.html`
- `contact/index.txt`
- `service-areas/index.html`
- `service-areas/index.txt`

A later approved Ice static revision-payload cleanup on 2026-06-05 removed `revision.latestSnapshot` from public static snapshot artifacts without editing CMS revisions. Current strict media URL errors are cleared.

## Other Blockers

- contact form production readiness remains `no`
- Azure staging readiness remains `no`
- DNS cutover readiness remains `no`
- production/indexing readiness remains not live-ready
- Roller remains paused
