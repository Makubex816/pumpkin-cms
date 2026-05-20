# Media Picker And Page Image Slots

## Purpose

Phase 6L connects the tenant-scoped Media Library to the structured Page Editor. The picker is a metadata workflow only: it selects existing `MediaAsset` records and copies URL, alt text, asset reference, license, usage, dimensions, and focal point metadata into page image fields. It does not upload files, copy binaries, deploy assets, or configure production storage.

## Media Library vs Media Picker

- Media Library stores tenant-scoped asset metadata for existing image URLs.
- Media Picker is the Page Editor control used to select one of those registered assets.
- Page media slots still allow manual URL entry as a fallback.
- The public site renders from page JSON/CMS data exactly as before.

## Page-Level Image Slots

The editor supports picker selection for:

- `media.featuredImage`
- `media.heroImage`
- `media.localImage`
- `media.closingImage`
- Open Graph image URL/alt mirror

The first four slots retain:

- `assetId`
- `url`
- `alt`
- `title`
- `caption`
- `source`
- `licenseStatus`
- `usageStatus`
- `width` / `height`
- `focalPointX` / `focalPointY`
- `decorative`

Open Graph image currently stores URL and alt text only in the existing SEO/media shape.

## Block Image Fields

The picker is available for supported structured block image fields:

- Hero `backgroundImage` and `mainImage`
- CardGrid card `image`
- HowItWorks step `image`
- PrimaryCTA `backgroundImage` and `mainImage`

For block images, the selected URL and alt text are copied into the existing rendering fields. Companion metadata fields such as `imageAssetId`, `imageLicenseStatus`, `imageUsageStatus`, and focal point values are preserved with the block content for admin and export workflows.

## Validation Warnings

The editor warns when:

- an image URL has no Media Library `assetId`
- a non-decorative image has no alt text
- a decorative image has unnecessary alt text
- license status is missing, `unknown`, or `needs_review`
- a published page uses an image not marked `approved_for_publish`
- featured/hero images have no focal point

Warnings are advisory. They do not block saving yet.

## Static Publishing Impact

Media picker changes save through the existing authenticated page update path, so page revision capture and `staticPublishing.needsRebuild` behavior stay intact. Static export remains URL-based; this phase does not copy media files into the static output.

Future production asset work should add Azure Blob/Storage or CDN-backed binary hosting, automatic dimension extraction, and a stronger asset usage scanner.
