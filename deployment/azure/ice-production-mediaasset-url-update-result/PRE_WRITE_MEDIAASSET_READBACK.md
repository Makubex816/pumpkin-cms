# Pre-Write MediaAsset Readback

Date: 2026-06-05

## Auth Gate

Admin auth probe passed before readback.

```text
GET /api/auth/verify: HTTP 200
safeCategory: valid
tokenPrinted: false
cmsWritePerformed: false
```

Environment values were not printed.

## Result

All 9 approved Ice MediaAsset records were readable before write.

```text
checked: 9
readable: 9
tenant/site matched Ice: 9
local media URL fields present before update: 9
missing IDs: 0
tenant mismatches: 0
site mismatches: 0
```

All 9 records had lifecycle `status: draft` before the update. That status was documented and preserved.

## Current Safe Fields

| # | MediaAsset ID | Site | Status | Current `url` / `publicUrl` | Storage provider | Blob path |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `local-dev` | `ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `local-dev` | `ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `local-dev` | `ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` | `local-dev` | `ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `local-dev` | `ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `local-dev` | `ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `local-dev` | `ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `local-dev` | `ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `ice-rink-rentals` | `draft` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `local-dev` | `ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` |

Pre-write `thumbnailUrl` and original variant URL fields also used the same local `/media/...` URL shape and were included in the approved URL-field update.
