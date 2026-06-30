# Media Blob Inventory Result

Inventory method:

- Azure CLI with `--auth-mode login`.
- No storage keys, `listKeys`, SAS, or connection string generation.
- Container: `ice-rink-rentals-media`.
- Prefix: `ice-rink-rentals/assets/`.

Result:

- Blob count: `9`.
- All returned blobs were `image/png`.
- All returned blobs had cache control `public, max-age=31536000, immutable`.

Blob asset IDs:

- `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7`
- `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d`
- `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd`
- `corporateicerinkrentalevent-18e985ca59bd`
- `holidayicerink-973ce7691377`
- `icerinkrentalssetup-113d218572e4`
- `iceskatingrinkrentalslogo-0d1f970f0411`
- `partyproseastcoastlogo-cfd1fc9f60ae`
- `winterfesticerinkrentals-324b1b89777d`
