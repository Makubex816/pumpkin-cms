# Pre-Write Page Readback

Admin readback used the approved JWT against active Ice CMS pages only.

| Page | Published | Repairable active root fields | Unique local URLs | Blockers |
| --- | --- | ---: | ---: | ---: |
| `home` | true | 52 | 6 | 0 |
| `contact` | true | 50 | 8 | 0 |
| `service-areas` | true | 30 | 6 | 0 |

Approved roots were:

- `ContentData`
- `media`

The pre-write readback also found local media URLs in `revision.latestSnapshot.page.*`. Those are rollback snapshot fields, not active page body/media roots. They were not manually changed in this run.

No local media string outside `ContentData`, `media`, or `revision.latestSnapshot` blocked the approved active root repair.

