# Upload Result

Generated: 2026-06-05

## Command Shape

Each approved file was uploaded with:

```powershell
az storage blob upload `
  --account-name iceskatingmedia `
  --container-name ice-rink-rentals-media `
  --name "<approved checksum blob path>" `
  --file "<approved .local-media source path>" `
  --content-type "image/png" `
  --content-cache-control "public, max-age=31536000, immutable" `
  --auth-mode login `
  --overwrite false
```

## Upload Result

| Asset ID | Uploaded |
| --- | --- |
| `winterfesticerinkrentals-324b1b89777d` | yes |
| `corporateicerinkrentalevent-18e985ca59bd` | yes |
| `holidayicerink-973ce7691377` | yes |
| `icerinkrentalssetup-113d218572e4` | yes |
| `iceskatingrinkrentalslogo-0d1f970f0411` | yes |
| `partyproseastcoastlogo-cfd1fc9f60ae` | yes |
| `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | yes |
| `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | yes |
| `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | yes |

## Safety Result

Exactly 9 approved files were uploaded.

No unapproved file was uploaded.

No raw content-review input was uploaded.

No keys, connection strings, or SAS URLs were used or printed.
