# Remaining Media Blockers

## Resolved In This Run

Active page body/media root URL readiness is now `yes`.

```text
active ContentData local media URLs: 0
active media local media URLs: 0
rendered local img tags: 0
```

## Still Blocked

Full media production URL readiness remains `no`.

The page API stores a rollback snapshot under `revision.latestSnapshot.page`. After the approved active-root repair, that snapshot intentionally contains the pre-repair page state. The static export serializes that revision snapshot into the generated page payloads, so strict validators still find local `/media/ice-rink-rentals/...` strings in:

- `index.html`
- `index.txt`
- `contact/index.html`
- `contact/index.txt`
- `service-areas/index.html`
- `service-areas/index.txt`

Manual stale revision/rollback snapshot editing was not approved in this run. The run stopped at documentation for that boundary.

## Other Blockers

- contact form production readiness remains `no`
- Azure staging readiness remains `no`
- DNS cutover readiness remains `no`
- production/indexing readiness remains not live-ready
- Roller remains paused

