# Post-Cleanup Local Media Audit

After rerunning `npm run export:static:ice:cms`, local media strings from the revision rollback payload were absent from public static output.

| Output file | Exists | Local media strings | Rendered local img tags | Production media strings | `latestSnapshot` mentions |
| --- | --- | ---: | ---: | ---: | ---: |
| `index.html` | yes | 0 | 0 | 66 | 0 |
| `index.txt` | yes | 0 | 0 | 52 | 0 |
| `contact/index.html` | yes | 0 | 0 | 64 | 0 |
| `contact/index.txt` | yes | 0 | 0 | 50 | 0 |
| `service-areas/index.html` | yes | 0 | 0 | 41 | 0 |
| `service-areas/index.txt` | yes | 0 | 0 | 30 | 0 |

All text export output:

```text
local /media/ice-rink-rentals occurrences: 0
latestSnapshot mentions: 0
```

Snapshot page JSON:

| Snapshot page | Slug | Local media strings | Production media strings | `revision` object present | `revision.latestSnapshot` present |
| --- | --- | ---: | ---: | --- | --- |
| `contact.json` | `contact` | 0 | 50 | yes | no |
| `home.json` | `home` | 0 | 52 | yes | no |
| `service-areas.json` | `service-areas` | 0 | 30 | yes | no |

