# Current Source Comparison

| Area | Current repo source | Backup source |
| --- | --- | --- |
| Home page | minimal seed page, 6 block types | richer page, 13 block entries |
| Service areas page | minimal seed page, 6 block types | richer page, 9 block entries |
| Contact page | minimal seed page, 5 block types | richer page, 11 block entries |
| Image fields | empty in current seed pages | media slots populated |
| `apps/ice-rink-web/public` | missing | not supplied by zip |
| Deployable image files | `0` in current static output | `0` in uploaded zip |
| Media metadata | not present in current seed source | 12 MediaAsset records |
| Blob inventory | not present in current source | 9 live-readonly blob records |

Current seed page titles:

- `/`: Portable Ice Rink Rentals for Events
- `/service-areas`: Portable Ice Rink Rental Service Areas
- `/contact`: Request an Ice Rink Rental Quote

Backup page titles:

- `/`: Portable Ice Skating Rink Rentals for Events | Ice Rink Rentals
- `/service-areas`: Portable Ice Rink Rental Service Areas | Ice Rink Rentals
- `/contact`: Request an Ice Rink Rental Quote | Ice Rink Rentals

Conclusion: the backup is implementation-ready as a content and media-reference source, but not as a binary-complete source.

