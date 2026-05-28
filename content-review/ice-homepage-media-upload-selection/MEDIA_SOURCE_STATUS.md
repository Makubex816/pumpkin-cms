# Media Source Status

## Start-State Note

At the first status check, the five PNGs were untracked under `content-review/ice-homepage-media-upload-selection/`, not under the requested raw-input folder. They were moved into `content-review/ice-homepage-media-input/` so the output folder remains manifest/report-only.

## Raw Files

| File | Present | MIME | Dimensions | Size bytes | SHA-256 | Status |
| --- | --- | --- | --- | ---: | --- | --- |
| IceSkatingRinkRentalsLogo.png | yes | image/png | 1448x1086 | 1627660 | 0d1f970f0411e0778405f0a9cce316f0c7affca36e27576d4ebef751782f075b | valid-local-input |
| WinterFestIceRinkRentals.png | yes | image/png | 1672x941 | 3607110 | 324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c | valid-local-input |
| CorporateIceRinkRentalEvent.png | yes | image/png | 1672x941 | 3685341 | 18e985ca59bd67b3f1d74a1a3841a273081b8f8a9ddb97d67dc6ff233e559a2d | valid-local-input |
| HolidayIceRink.png | yes | image/png | 1672x941 | 3866376 | 973ce769137773ecb68c439a192ae7bb96f7be2365a591c651c3fcc746c0f853 | valid-local-input |
| IceRinkRentalsSetup.png | yes | image/png | 1448x1086 | 3545952 | 113d218572e45a8744673e3b86e2ea7d2e75dfacfcd8a0756a767f59c5ad3f40 | valid-local-input |

## Upload Feasibility

- Result: `blocked-missing-safe-admin-auth`
- Upload attempted: no
- Upload skipped: yes
- Reason: Raw files are present, but the real MediaAsset upload endpoint requires authenticated admin JWT/API access. No protected config or token values were read or printed.
- Protected config read: no
- Secrets printed: no
- CMS Page records changed: no
- CMS Theme records changed: no
- Azure/cloud upload required: no
