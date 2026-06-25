# Existing Prefix Blob List Result

Read-only prefix listing:

```text
az storage blob list --account-name iceskatingmedia --container-name ice-rink-rentals-media --prefix ice-rink-rentals/ --auth-mode login
```

Result: listing succeeded.

## Existing Blobs

| Blob name | Size | Content type | Cache control | Last modified |
| --- | ---: | --- | --- | --- |
| `ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `2253456` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:52+00:00` |
| `ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `2105292` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:54+00:00` |
| `ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `1923827` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:50+00:00` |
| `ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png` | `3685341` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:38+00:00` |
| `ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png` | `3866376` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:41+00:00` |
| `ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png` | `3545952` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:45+00:00` |
| `ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png` | `1627660` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:47+00:00` |
| `ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png` | `24434` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:48+00:00` |
| `ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png` | `3607110` | `image/png` | `public, max-age=31536000, immutable` | `2026-06-05T12:07:34+00:00` |

## Summary

- Existing blobs under prefix: `9`.
- Existing blobs under `ice-rink-rentals/assets/`: `9`.
- Existing blobs at planned canonical paths: `0`.
- Exact planned name collisions: `0`.

This was a metadata listing only. No public URL HEAD checks were run in this phase.
