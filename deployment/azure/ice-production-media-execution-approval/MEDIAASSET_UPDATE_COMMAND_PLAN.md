# MediaAsset Update Command Plan

Generated: 2026-06-04

## Scope

Future examples only. No CMS records or MediaAsset records were read live or changed in this preparation pass. No Admin JWT or API key was used.

## Current Local State

Current production-blocking URL shape:

```text
/media/ice-rink-rentals/2026/06/{safeFileName}
```

Future production URL shape:

```text
https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

## Exact Update Set

| MediaAsset ID | Current local URL | Proposed target CDN URL |
| --- | --- | --- |
| `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d` | `/media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png` |
| `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd` | `/media/ice-rink-rentals/2026/06/corporateicerinkrentalevent-18e985ca59bd.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/corporateicerinkrentalevent-18e985ca59bd/18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d/corporateicerinkrentalevent-18e985ca59bd.png` |
| `ice-rink-rentals-holidayicerink-973ce7691377` | `/media/ice-rink-rentals/2026/06/holidayicerink-973ce7691377.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/holidayicerink-973ce7691377/973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853/holidayicerink-973ce7691377.png` |
| `ice-rink-rentals-icerinkrentalssetup-113d218572e4` | `/media/ice-rink-rentals/2026/06/icerinkrentalssetup-113d218572e4.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/icerinkrentalssetup-113d218572e4/113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40/icerinkrentalssetup-113d218572e4.png` |
| `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411` | `/media/ice-rink-rentals/2026/06/iceskatingrinkrentalslogo-0d1f970f0411.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/iceskatingrinkrentalslogo-0d1f970f0411/0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b/iceskatingrinkrentalslogo-0d1f970f0411.png` |
| `ice-rink-rentals-partyproseastcoastlogo-cfd1fc9f60ae` | `/media/ice-rink-rentals/2026/06/partyproseastcoastlogo-cfd1fc9f60ae.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/partyproseastcoastlogo-cfd1fc9f60ae/cfd1fc9f60aee99c8d9c981f3eab7e7ce45d402343b9aa3bfa207f0dbb4e7582/partyproseastcoastlogo-cfd1fc9f60ae.png` |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd/841162071dfd3c5651f6111d3f6ed84354a8c60fc94a545e8648aea31f136b0a/chatgpt-image-jun-3--2026--12_37_40-pm-841162071dfd.png` |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7/9ab697f5d9c704a3525382f0fbec020977053f592e2d1203998717e28badaa54/chatgpt-image-jun-3--2026--01_25_32-pm-9ab697f5d9c7.png` |
| `ice-rink-rentals-chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d` | `/media/ice-rink-rentals/2026/06/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` | `https://media.iceskatingrinkrentals.com/ice-rink-rentals/assets/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d/40c9a505552d4cb278eb0912581d75566f0d717b97357c42934f0b59c2158120/chatgpt-image-jun-3--2026--01_26_01-pm-40c9a505552d.png` |

## Runtime-Only Secret Requirements

Future MediaAsset writes require runtime-only credentials such as:

- Pumpkin API URL
- Ice tenant identifier
- Ice tenant API key
- Pumpkin admin JWT

Do not commit, print, echo, or paste these values. If a future run checks credential presence, it should print only `PRESENT` or `MISSING`.

## Read-Only Check Examples

Future examples only:

```powershell
node <approved-readonly-mediaasset-script>.mjs --site ice-rink-rentals --ids <MEDIA_ASSET_ID_LIST>
```

Stop point: verify records and capture rollback values before any write.

## Future Write Plan Shape

Run only after explicit approval for MediaAsset record updates:

```powershell
node <approved-mediaasset-update-script>.mjs `
  --site ice-rink-rentals `
  --asset-map deployment/azure/ice-production-media-execution-approval/<approved-target-map-file> `
  --readback `
  --no-unrelated-records
```

The actual script path and payload must be confirmed in the approved execution run.

## Readback Verification

After any approved update:

1. read back each of the 9 MediaAsset records
2. confirm only approved records changed
3. confirm only approved fields changed plus server-managed metadata
4. confirm target CDN URLs exactly match the approved map
5. confirm no local `/media/ice-rink-rentals/...` URL remains in production-bound fields
6. confirm provider/status/readiness fields match the approved policy
7. rerun static export and validators

## Rollback Strategy

Before writes:

- capture previous values for every field to be changed
- keep local media cache available during rollback window
- keep uploaded checksum URLs live during rollback window
- prepare a reverse update plan that restores previous MediaAsset values

## Current Run Result

No CMS writes occurred. No MediaAsset writes occurred. No Admin JWT or API key was used.
