# Static Export Result

Command:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

Exit code:

```text
0
```

Snapshot result:

| Field | Result |
| --- | --- |
| pageCount | 3 |
| publishedCount | 3 |
| slugs | `contact`, `home`, `service-areas` |
| excluded slugs | `events-holiday-activations`, `ice-rink-rentals`, `phase-5a-csv-import-54754949` |
| themeSnapshot | true |

Route output:

| Location | Routes |
| --- | --- |
| `apps/ice-rink-web/out` | `/`, `/contact`, `/service-areas` |
| `apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out` | `/`, `/contact`, `/service-areas` |

Preview/obsolete deployable paths:

```text
0
```

Rendered image tags after export:

| File | Local `/media` img tags | Production media img tags |
| --- | ---: | ---: |
| `index.html` | 0 | 9 |
| `contact/index.html` | 0 | 7 |
| `service-areas/index.html` | 0 | 6 |

The export still includes serialized rollback snapshot payloads with local media URLs. Those are not active page body/media roots.

