# Next Phase Prompt

Use this prompt only if the operator explicitly approves a future upload/readback execution phase.

```text
Approve V2.8.19F Azure Media Upload and Readback Execution Boundary for IceSkatingRinkRentals.com recovered media assets only.

Scope:
- Use the completed V2.8.19E resolved Azure media target no-write approval packet.
- Upload only the 8 rows marked readyForUpload true in:
  deployment/architecture/tenant-website-publish-readiness/v2-8-19e-resolved-azure-media-target-upload-approval-result/final-azure-media-upload-manifest.md
- Keep the 3 contact replacement rows excluded unless contactReplacementAssetsApproved is explicitly changed to true.
- Use Azure Blob Storage account iceskatingmedia in resource group rg-ice-production-media.
- Use container ice-rink-rentals-media.
- Use target prefix ice-rink-rentals/.
- Use public base URL https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media.
- Use Azure CLI login/RBAC only with --auth-mode login.
- Set content type image/png.
- Set cache-control public, max-age=31536000, immutable.
- Enforce fail-if-exists behavior unless explicit overwrite approval is separately granted.
- After upload, read back blob properties through RBAC and record size, content type, cache-control, name, and public URL shape.
- Run public blob URL HEAD checks only if explicitly included in the approval.
- Create a V2.8.19F result package and root report.

Hard stops:
- Do not deploy.
- Do not mutate DNS/custom domains.
- Do not enable or update static website hosting.
- Do not create containers.
- Do not change public access.
- Do not use account keys, keys/listKeys, connection strings, SAS, deployment tokens, or fallback key auth.
- Do not read protected config, .env.local, appsettings, local.settings, or Key Vault secrets.
- Do not upload the 3 contact replacement rows unless approval changes.
- Do not stage or commit image binaries into the repo.
- Do not submit contact forms, crawl production, run Search Console/indexing, or publish live changes.
```

Because `ownerAllowsAzureMediaUploadExecutionNextPhase` is currently false, this prompt is a future explicit approval prompt only. It is not active upload authorization.
