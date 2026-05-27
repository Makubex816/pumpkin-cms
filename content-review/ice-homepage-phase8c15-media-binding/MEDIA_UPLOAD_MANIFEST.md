# Media Upload Manifest

No upload was attempted. This manifest defines the intended upload actions once raw media files are provided again and upload is explicitly authorized.

Endpoint when authorized: `POST /api/admin/{tenantId}/media-assets/upload`.

Authentication is required and no protected config was read in this phase.

| Slot | Source expected | Safe filename | Status | Blocks CMS import |
| --- | --- | --- | --- | --- |
| site-logo-primary | content-review/ice-homepage-phase8c15-media-input/IceSkatingRinkRentalsLogo.png | ice-skating-rink-rentals-logo.png | blocked-missing-source-file | yes |
| homepage-hero-image | content-review/ice-homepage-phase8c15-media-input/WinterFestIceRinkRentals.png | homepage-hero-winter-fest-ice-rink.webp | blocked-missing-source-file | yes |
| homepage-corporate-event-image | content-review/ice-homepage-phase8c15-media-input/CorporateIceRinkRentalEvent.png | homepage-corporate-ice-rink-event.webp | blocked-missing-source-file | no |
| homepage-setup-logistics-image | content-review/ice-homepage-phase8c15-media-input/IceRinkRentalsSetup.png | homepage-portable-rink-setup.webp | blocked-missing-source-file | no |
| homepage-holiday-shopping-center-image | content-review/ice-homepage-phase8c15-media-input/HolidayIceRink.png | homepage-holiday-shopping-center-rink.webp | blocked-missing-source-file | no |
| homepage-open-graph-image | content-review/ice-homepage-phase8c15-media-input/WinterFestIceRinkRentals.png | og-ice-skating-rink-rentals-homepage.webp | blocked-missing-source-file | yes |
