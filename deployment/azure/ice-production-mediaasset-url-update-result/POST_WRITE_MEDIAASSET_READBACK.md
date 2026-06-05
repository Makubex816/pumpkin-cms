# Post-Write MediaAsset Readback

Date: 2026-06-05

## Result

Post-write readback passed for all 9 approved records.

```text
checked: 9
tenant/site matched Ice: 9
url matched expected production URL: 9
publicUrl matched expected production URL: 9
thumbnailUrl matched expected production URL: 9
storageProvider azure-blob: 9
storageContainer ice-rink-rentals-media: 9
checksum/hash matched expected checksum: 9
local /media URL fields remaining in updated MediaAsset URL fields: 0
non-target MediaAsset IDs changed: 0
Roller records touched: 0
```

All 9 records still have lifecycle `status: draft`; this was preserved intentionally because the approved scope was URL/storage metadata, not MediaAsset lifecycle activation.

## Production URL Readback

| # | MediaAsset ID | Post-write `url` / `publicUrl` |
| ---: | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png` |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png` |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png` |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png` |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png` |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png` |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` |
