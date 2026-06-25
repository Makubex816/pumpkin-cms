# Pumpkin Tenant Website Publish Readiness V2.8.19B Asset Collection Canonical Rename Report

Phase status: complete local asset collection, canonical rename, and Azure upload staging preflight.

Lane: V2.8 Tenant Website / Public Website Regression Recovery.

Classification: `asset_collection_canonical_rename_azure_upload_staging_preflight_no_upload_no_deploy`.

No Azure upload, Azure mutation, or deploy was performed in V2.8.19B.

## Summary

V2.8.19B used the V2.8.19A/A2/A3 recovery evidence and current external recovery intake files to build an outside-repo upload staging set for IceSkatingRinkRentals.com media recovery.

The canonical staging folder is outside the repo:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\azure-upload-staging\v2-8-19b
```

The preview extraction quarantine is outside the repo:

```text
C:\Users\User\Desktop\PumpkinCMS\ice-site-recovery-intake\preview-extracted-media\v2-8-19b
```

## Key Results

- Selected upload-staging image copies: `10`.
- Upload-staging bytes: `34385062`.
- Upload-staging files inside repo: `0`.
- Preview-extracted embedded media files: `14`.
- Preview-extracted bytes: `2370304`.
- Zip image candidates inventoried: `22`.
- Loose top-level image files found in external intake: `0`.
- Selected target slots with ready-for-upload staging copies: `7`.
- Selected contact replacement slots staged but pending owner approval: `3`.
- Unresolved canonical target slots: `1`.
- Azure upload manifest created with `uploadApproved: false` for every row.

## Asset Status

Recovered originals staged:

- `CorporateIceRinkRentalEvent.png`
- `HolidayIceRink.png`
- `IceRinkRentalsSetup.png`
- `IceSkatingRinkRentalsLogo.png`
- `WinterFestIceRinkRentals.png`

Contact replacement candidates staged:

- `ice-rink-rentals/contact/ice-rink-rental-consultation.png`
- `ice-rink-rentals/contact/event-ice-rink-planning.png`
- `ice-rink-rentals/contact/ice-rink-installation-preview.png`

These are staged from existing recovered originals referenced by the contact preview/design evidence. They are not the original three missing contact AI binaries and require owner visual approval before upload.

Unresolved target:

- `ice-rink-rentals/partners/party-pros-east-coast-logo.png`

Weak PPEC reference assets existed, but none matched the expected Party Pros East Coast logo identity or size, and earlier carryforward warned that the old PPEC wordmark-card asset should not be used as the active partner logo.

## Boundary Confirmation

No SWA deploy, Azure media upload, Azure mutation, DNS/custom-domain mutation, Search Console/indexing action, token reset/print/use, protected config read, suspected secret content inspection, `.env.local` access, contact-form POST, production crawl, live outbound URL check, live publication, backup/archive copy into repo, upload-staging copy into repo, backup staging, source integration, or image commit occurred.

Production boundary remains unchanged: `swa-ice-static-staging` is production-bound because real custom domains are attached, and `swa-ice-static-isolated-staging` is the safe isolated staging target for later phases only after explicit approval.
