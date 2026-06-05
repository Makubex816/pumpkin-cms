# Post-Upload Verification

Generated: 2026-06-05

## Blob Count And Path Set

Post-upload blob list result:

```text
blobCount=9
expectedCount=9
unexpectedCount=0
missingCount=0
```

## Per-Blob Verification

| Asset ID | Exists | Size matched source | Content type | Cache-control matched |
| --- | --- | --- | --- | --- |
| `winterfesticerinkrentals-324b1b89777d` | yes | yes | `image/png` | yes |
| `corporateicerinkrentalevent-18e985ca59bd` | yes | yes | `image/png` | yes |
| `holidayicerink-973ce7691377` | yes | yes | `image/png` | yes |
| `icerinkrentalssetup-113d218572e4` | yes | yes | `image/png` | yes |
| `iceskatingrinkrentalslogo-0d1f970f0411` | yes | yes | `image/png` | yes |
| `partyproseastcoastlogo-cfd1fc9f60ae` | yes | yes | `image/png` | yes |
| `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | yes | yes | `image/png` | yes |
| `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | yes | yes | `image/png` | yes |
| `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | yes | yes | `image/png` | yes |

Expected cache-control:

```text
public, max-age=31536000, immutable
```

## Verification Notes

The Windows Azure CLI path made `length(@)` and JSON-array parsing unreliable in PowerShell, so final verification used TSV blob-name listing plus exact per-path `az storage blob show` checks.

No keys, connection strings, or SAS URLs were used.
