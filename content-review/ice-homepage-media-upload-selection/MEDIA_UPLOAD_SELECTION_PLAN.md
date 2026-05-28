# Media Upload Selection Plan

## Plan

1. Use the five official PNGs in `content-review/ice-homepage-media-input/`.
2. Upload each file through the authenticated Pumpkin admin media endpoint when a safe local admin session is available.
3. Preserve tenant/site identity as `ice-rink-rentals` / `ice-rink-rentals`.
4. Copy real returned MediaAsset IDs into the homepage media candidate only after records exist.
5. Do not update CMS Page or Theme records in this phase.

## Current Binding Plan

| Slot | Source file | Usage | Source found | MediaAsset ID | Status |
| --- | --- | --- | --- | --- | --- |
| site-logo-primary | IceSkatingRinkRentalsLogo.png | logo | yes | null | blocked-missing-safe-admin-auth |
| homepage-hero-image | WinterFestIceRinkRentals.png | hero | yes | null | blocked-missing-safe-admin-auth |
| homepage-corporate-event-image | CorporateIceRinkRentalEvent.png | card | yes | null | blocked-missing-safe-admin-auth |
| homepage-setup-logistics-image | IceRinkRentalsSetup.png | inline | yes | null | blocked-missing-safe-admin-auth |
| homepage-holiday-shopping-center-image | HolidayIceRink.png | card | yes | null | blocked-missing-safe-admin-auth |
| homepage-open-graph-image | WinterFestIceRinkRentals.png | og-image | yes | null | blocked-missing-safe-admin-auth |

## Current Blocker

`blocked-missing-safe-admin-auth`: Raw files are present, but the real MediaAsset upload endpoint requires authenticated admin JWT/API access. No protected config or token values were read or printed.
