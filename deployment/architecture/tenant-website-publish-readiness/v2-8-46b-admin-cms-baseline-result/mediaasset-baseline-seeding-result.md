# MediaAsset Baseline Seeding Result

Admin MediaAsset route used:

- `POST /api/admin/{tenantId}/media-assets`

All writes were metadata-only and scoped to `ice-rink-rentals`. No blob upload, blob delete, container mutation, storage key, SAS, or connection string operation occurred.

Created records:

| MediaAsset ID | Asset ID | HTTP | Status | Storage |
| --- | --- | ---: | --- | --- |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | 201 | active | azure-blob |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | 201 | active | azure-blob |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | 201 | active | azure-blob |
| `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `corporateicerinkrentalevent-18e985ca59bd` | 201 | active | azure-blob |
| `ice-rink-rentals-holidayicerink-973ce7691377` | `holidayicerink-973ce7691377` | 201 | active | azure-blob |
| `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `icerinkrentalssetup-113d218572e4` | 201 | active | azure-blob |
| `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `iceskatingrinkrentalslogo-0d1f970f0411` | 201 | active | azure-blob |
| `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `partyproseastcoastlogo-cfd1fc9f60ae` | 201 | active | azure-blob |
| `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `winterfesticerinkrentals-324b1b89777d` | 201 | active | azure-blob |

Final readback:

- MediaAsset count: `9`.
- Active count: `9`.
- Azure Blob storage provider count: `9`.
- Blob path present count: `9`.
