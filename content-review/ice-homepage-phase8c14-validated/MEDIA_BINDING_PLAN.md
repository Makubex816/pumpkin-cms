# Media Binding Plan

Media binding uses the Phase 8C.9 MediaAsset pipeline contract. The local files are source candidates only.

| Slot | Usage | Page | Section | Source | Optimized | Alt | Status | Blocker |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| site-logo-primary | logo | global-theme-homepage-reference | site-header-footer-branding | content-review/ice-homepage-phase8c14-input/media/IceSkatingRinkRentalsLogo.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/logo-iceskatingrinkrentals-cropped.png | IceSkatingRinkRentals.com logo | needs-upload | yes |
| homepage-hero-image | hero | / | homepage-hero | content-review/ice-homepage-phase8c14-input/media/WinterFestIceRinkRentals.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/hero-winter-fest-ice-rink.webp | Portable ice skating rink at a festive evening winter event with guests skating under string lights | needs-upload | yes |
| homepage-corporate-event-image | card | / | event-types | content-review/ice-homepage-phase8c14-input/media/CorporateIceRinkRentalEvent.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/corporate-ice-rink-event.webp | Evening corporate ice rink rental event outside office buildings | needs-upload | no |
| homepage-setup-logistics-image | inline | / | rental-options | content-review/ice-homepage-phase8c14-input/media/IceRinkRentalsSetup.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/portable-rink-setup.webp | Portable ice skating rink setup with white rink barriers and skating aids | needs-upload | no |
| homepage-holiday-shopping-center-image | card | / | public-holiday-events | content-review/ice-homepage-phase8c14-input/media/HolidayIceRink.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/holiday-shopping-center-rink.webp | Holiday ice rink at a shopping center with guests and festive lights | needs-upload | no |
| homepage-open-graph-image | og-image | / | seo-open-graph | content-review/ice-homepage-phase8c14-input/media/WinterFestIceRinkRentals.png | content-review/ice-homepage-phase8c14-input/extracted/ice-homepage-phase8k-cf7-template-pack/assets/hero-winter-fest-ice-rink.webp | Portable ice skating rink rental for a winter event | needs-upload | yes |

Rules preserved:

- `mediaAssetId` remains `null` because no CMS MediaAsset upload/selection occurred.
- No fake `publicUrl` values are used.
- No base64 images are used.
- No random external image URLs are used.
- Upload/selection through the MediaAsset pipeline remains required before CMS import for required slots.
- Open Graph final crop still needs approval before production/indexing.
