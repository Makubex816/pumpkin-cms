# MediaAsset Update Result

Date: 2026-06-05

## Result

MediaAsset updates performed:

```text
9/9
```

The write call used only:

```text
PATCH /api/admin/{tenantId}/media-assets/{id}
```

No create, delete, archive, restore, replace, page, theme, navigation, form, Roller, Azure, Cloudflare, deployment, email, or Microsoft 365 write action was performed.

## Changed Records

| # | MediaAsset ID | Result |
| ---: | --- | --- |
| 1 | `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | patched |
| 2 | `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | patched |
| 3 | `ice-rink-rentals-holidayicerink-973ce7691377` | patched |
| 4 | `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | patched |
| 5 | `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | patched |
| 6 | `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | patched |
| 7 | `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | patched |
| 8 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | patched |
| 9 | `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | patched |

Tenant MediaAsset count before and after:

```text
before: 12
after: 12
```

Changed MediaAsset IDs:

```text
9 approved IDs only
```

Non-target MediaAsset IDs changed:

```text
0
```

## Fields Changed

Only production media URL/storage metadata fields were changed:

- `url`
- `publicUrl`
- `thumbnailUrl`
- `storageProvider`
- `storageContainer`
- `blobPath`
- `checksum`
- `hash`
- `safeFileName`
- `variants[].url`
- `variants[].publicUrl`
- `variants[].storageProvider`
- `variants[].blobPath`

Lifecycle `status` stayed `draft` on all 9 records.
