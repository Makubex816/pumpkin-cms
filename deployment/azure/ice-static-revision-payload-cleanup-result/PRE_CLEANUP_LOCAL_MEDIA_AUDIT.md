# Pre-Cleanup Local Media Audit

This records the post page-body-repair baseline before the static revision payload cleanup.

Active page body/media roots were already clean, and rendered local image tags were already clean. The remaining local media strings were serialized admin rollback payload data under `revision.latestSnapshot`.

| Output file | Route | Local media strings | Rendered local img tags | `latestSnapshot` mentions | Source classification |
| --- | --- | ---: | ---: | ---: | --- |
| `index.html` | `/` | 52 | 0 | 1 | `page.revision.latestSnapshot.page...` |
| `index.txt` | `/` | 52 | 0 | 1 | `page.revision.latestSnapshot.page...` |
| `contact/index.html` | `/contact` | 50 | 0 | 1 | `page.revision.latestSnapshot.page...` |
| `contact/index.txt` | `/contact` | 50 | 0 | 1 | `page.revision.latestSnapshot.page...` |
| `service-areas/index.html` | `/service-areas` | 30 | 0 | 1 | `page.revision.latestSnapshot.page...` |
| `service-areas/index.txt` | `/service-areas` | 30 | 0 | 1 | `page.revision.latestSnapshot.page...` |

The path prefix for the stale payloads was:

```text
page.revision.latestSnapshot.page.ContentData...
page.revision.latestSnapshot.page.media...
```

No occurrence was active public-rendering content. If an active rendered occurrence had been found, the run would have stopped instead of hiding it.

