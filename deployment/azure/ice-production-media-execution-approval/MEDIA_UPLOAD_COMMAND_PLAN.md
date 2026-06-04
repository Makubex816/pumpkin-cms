# Media Upload Command Plan

Generated: 2026-06-04

## Scope

Future examples only. No media files were uploaded, staged, committed, or modified in this preparation pass.

## Upload Source Decision

Future execution must first confirm whether `.local-media` files may be used as source upload files. If not, original raw source files must be restored or provided.

## Source Files

Current source candidate folder:

```text
apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/
```

## Read-Only Verification First

Future local verification examples:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png"
Get-Item "apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png" | Select-Object FullName,Length
```

Future Azure read-only example:

```powershell
az storage blob exists `
  --account-name <STORAGE_ACCOUNT_NAME> `
  --container-name <MEDIA_CONTAINER_NAME> `
  --name "ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png" `
  --auth-mode login
```

Stop point: compare source hash, size, MIME type, target path, and existing blob state before upload.

## Future Upload Examples

Run only after explicit approval for media upload.

Example for one file:

```powershell
az storage blob upload `
  --account-name <STORAGE_ACCOUNT_NAME> `
  --container-name <MEDIA_CONTAINER_NAME> `
  --name "ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png" `
  --file "apps/pumpkin-api/.local-media/ice-rink-rentals/2026/06/winterfesticerinkrentals-324b1b89777d.png" `
  --content-type "image/png" `
  --content-cache-control "public, max-age=31536000, immutable" `
  --auth-mode login `
  --overwrite false
```

Stop point: verify the uploaded blob hash, status, content type, and cache headers before uploading the remaining files.

## Upload Set

Upload only the 9 approved media files listed in `MEDIAASSET_UPDATE_COMMAND_PLAN.md`.

## Current Run Result

No media upload occurred. Raw images and `.local-media` files were not staged.
