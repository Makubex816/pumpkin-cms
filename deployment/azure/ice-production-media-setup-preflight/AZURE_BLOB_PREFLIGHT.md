# Azure Blob Preflight

Generated: 2026-06-04

## Scope

This is an Azure Blob setup plan only. No Azure CLI command was run, no Azure credentials were read, no storage account was created, no Blob container was created, and no media was uploaded.

## Storage Account Naming Constraints

Azure Storage account names must generally be:

- 3 to 24 characters
- lowercase letters and numbers only
- globally unique
- without hyphens or underscores

Proposed naming approach:

- use a short Ice-specific storage account name approved by the user
- keep the name environment-specific if staging and production need separate accounts
- avoid embedding secrets, dates that imply rotation, or customer data

Example candidate shape only:

```text
iceskatingmedia
```

The exact account name must be approved before resource creation.

## Proposed Container

Proposed container name:

```text
ice-rink-rentals-media
```

Container naming constraints:

- lowercase letters, numbers, and hyphens
- starts and ends with a letter or number
- 3 to 63 characters
- no consecutive hyphens

## Proposed Blob Path Layout

```text
ice-rink-rentals/assets/{assetId}/{checksum}/{safeFileName}
```

Example:

```text
ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png
```

## Cache-Control Recommendation

For checksum-versioned media:

```text
Cache-Control: public, max-age=31536000, immutable
```

If any mutable index or manifest is introduced later, it should use short TTL or no-cache behavior. No mutable media manifest is proposed in this preflight.

## Content-Type Requirements

All current blocker files are PNG source candidates and should be uploaded with:

```text
Content-Type: image/png
```

Future execution must confirm MIME type from the exact upload file before upload.

## Immutability And Versioning

Recommended approach:

- treat checksum-versioned paths as immutable
- never overwrite a blob at an existing checksum path with different bytes
- retain old checksum paths through the rollback window
- use a new checksum path when a binary changes
- document retention/rollback policy before MediaAsset URLs are changed

## Future Environment And Secret Placeholders

Placeholders only:

- Azure storage account name placeholder
- Azure container name placeholder
- Azure Blob origin endpoint placeholder
- Azure upload identity or deployment credential reference placeholder
- CDN/origin access policy reference placeholder

No values are included in this package.

## Required Approval Before Resource Creation

Explicit user approval is required before:

- creating or selecting the Azure Storage account
- creating the Blob container
- configuring access policy
- uploading files
- setting cache headers on blobs
- reading or using Azure credentials
- marking media production URL readiness `yes`

## Current Run Result

No Azure resources were created and no Blob containers were created.
