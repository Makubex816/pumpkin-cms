# Media Upload Selection Plan

## Decision

This run remains manifest-only. Real MediaAsset creation is blocked until raw media files are present and a safe authenticated local-dev upload/selection path is explicitly available without protected config.

## Required Workflow

1. Place approved source files in `content-review/ice-homepage-media-input/`.
2. Use the MediaAsset upload workflow for tenant `ice-rink-rentals` and siteKey `ice-rink-rentals`.
3. Create or select MediaAsset records with alt text, usage type, checksum, dimensions, title, caption, and tags from the manifest.
4. Bind real MediaAsset IDs into the homepage candidate.
5. Run .NET page contract, media, design-system, form, Tailwind/navigation, unsafe content, placeholder, route/canonical, and secret scans.
6. Run admin import/export preflight before any CMS write.

## Slot Summary

| Slot | Source file | Status | Binding status | MediaAsset ID | Blocks CMS import | Blocks staging | Blocks production |
| --- | --- | --- | --- | --- | --- | --- | --- |
| site-logo-primary | IceSkatingRinkRentalsLogo.png | needs-upload | blocked-missing-source-file | null | yes | yes | yes |
| homepage-hero-image | WinterFestIceRinkRentals.png | needs-upload | blocked-missing-source-file | null | yes | yes | yes |
| homepage-corporate-event-image | CorporateIceRinkRentalEvent.png | needs-upload | blocked-missing-source-file | null | no | yes | yes |
| homepage-setup-logistics-image | IceRinkRentalsSetup.png | needs-upload | blocked-missing-source-file | null | no | yes | yes |
| homepage-holiday-shopping-center-image | HolidayIceRink.png | needs-upload | blocked-missing-source-file | null | no | yes | yes |
| homepage-open-graph-image | WinterFestIceRinkRentals.png | needs-upload | blocked-missing-source-file | null | yes | yes | yes |
