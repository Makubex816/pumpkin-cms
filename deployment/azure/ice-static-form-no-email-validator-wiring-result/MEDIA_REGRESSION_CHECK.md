# Media Regression Check

Generated: 2026-06-05

Checked output:

```text
apps/ice-rink-web/out
```

## Results

| Check | Result |
| --- | --- |
| public `/media/ice-rink-rentals/...` strings | 0 files |
| rendered local `<img src="/media/...">` | 0 files |
| `latestSnapshot` mentions in public output | 0 files |
| preview/obsolete deployable paths | 0 |
| unique `media.iceskatingrinkrentals.com` URLs found | 9 |
| media URLs checked with HEAD | 9 |
| media URL failures | 0 |

The first media URL scan found escaped serialized URLs with trailing backslashes from Next payload text. After normalizing those escaped values, all checked media URLs returned successful responses.
