# Rollback Notes

This run changed only active root page body/media URL string fields on:

- `home`
- `contact`
- `service-areas`

Rollback, if separately approved, should affect only those active root URL fields and should restore the previous local `/media/ice-rink-rentals/...` values from the page API rollback snapshots or the documented local-to-production map.

Do not roll back MediaAsset records, Cloudflare, Azure, theme, navigation, forms, email/Microsoft 365, or Roller as part of this repair rollback.

The page API advanced normal revision metadata:

| Page | Page version | Revision number |
| --- | --- | --- |
| `home` | 23 -> 24 | 19 -> 20 |
| `contact` | 18 -> 19 | 18 -> 19 |
| `service-areas` | 9 -> 10 | 9 -> 10 |

The latest rollback snapshots still contain the pre-repair root page values because the API creates those snapshots automatically before saving the new active page state.

