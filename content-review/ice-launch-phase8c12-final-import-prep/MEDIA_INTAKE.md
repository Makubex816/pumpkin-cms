# Media Intake

Use the Phase 8C.9 MediaAsset pipeline. Do not use fake URLs, random external images, base64 images, or raw HTML image tags.

All listed media is currently `needs-upload` because no approved source files or MediaAsset IDs were provided in this phase.

## Required Media Slots

| Media Slot ID | Page | Section ID | Usage Type | Aspect Ratio | Recommended Dimensions | Required Alt Text | Suggested Filename | Required Before CMS Import | Required Before Production | MediaAsset ID | Upload Status | Blocker | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| homepage-featured-image | Homepage | featuredImage | hero | 16:9 | 2400x1350 | Portable ice rink rental event setup | ice-homepage-featured-2400w.jpg | yes | yes | null | needs-upload | yes | Required page media. |
| homepage-hero-image | Homepage | heroImage | hero | 16:9 | 2400x1350 | Portable ice rink rental for a seasonal event | ice-homepage-hero-2400w.jpg | yes | yes | null | needs-upload | yes | Hero media. |
| homepage-event-use-case-image | Homepage | localImage | inline | 4:3 | 1600x1200 | Event site planning for a temporary ice rink | ice-homepage-event-planning-1600w.jpg | yes | yes | null | needs-upload | yes | Supports use-case content. |
| homepage-closing-trust-image | Homepage | closingImage | card | 16:9 | 1600x900 | Guests enjoying a temporary ice rink event | ice-homepage-closing-event-1600w.jpg | yes | yes | null | needs-upload | yes | Closing trust/proof slot. |
| homepage-open-graph-image | Homepage | openGraphImage | og-image | 1.91:1 | 1200x630 | Portable ice rink rental planning | ice-homepage-og-1200x630.jpg | yes | yes | null | needs-upload | yes | Required before production social previews. |
| contact-featured-image | Contact | featuredImage | hero | 16:9 | 2400x1350 | Ice rink rental quote request planning | ice-contact-featured-2400w.jpg | yes | yes | null | needs-upload | yes | Required page media. |
| contact-hero-image | Contact | heroImage | hero | 16:9 | 2400x1350 | Portable ice rink quote planning | ice-contact-hero-2400w.jpg | yes | yes | null | needs-upload | yes | Hero media. |
| contact-quote-support-image | Contact | localImage | inline | 4:3 | 1600x1200 | Event detail checklist for portable ice rink rental | ice-contact-quote-checklist-1600w.jpg | yes | yes | null | needs-upload | yes | Supports quote guidance. |
| contact-closing-support-image | Contact | closingImage | card | 16:9 | 1600x900 | Portable ice rink event quote follow-up | ice-contact-follow-up-1600w.jpg | yes | yes | null | needs-upload | yes | Closing CTA support media. |
| contact-open-graph-image | Contact | openGraphImage | og-image | 1.91:1 | 1200x630 | Ice rink rental quote request | ice-contact-og-1200x630.jpg | yes | yes | null | needs-upload | yes | Required before production social previews. |
| service-areas-featured-image | Service Areas | featuredImage | hero | 16:9 | 2400x1350 | Portable ice rink rental service area planning | ice-service-areas-featured-2400w.jpg | yes | yes | null | needs-upload | yes | Required page media. |
| service-areas-hero-image | Service Areas | heroImage | hero | 16:9 | 2400x1350 | Map and venue planning for portable ice rink rentals | ice-service-areas-hero-2400w.jpg | yes | yes | null | needs-upload | yes | Hero media. |
| service-areas-map-region-image | Service Areas | localImage | inline | 4:3 | 1600x1200 | Event location review for temporary ice rink rental | ice-service-areas-region-review-1600w.jpg | yes | yes | null | needs-upload | yes | Map/region planning slot. |
| service-areas-closing-image | Service Areas | closingImage | card | 16:9 | 1600x900 | Portable rink availability inquiry | ice-service-areas-availability-1600w.jpg | yes | yes | null | needs-upload | yes | Closing CTA support media. |
| service-areas-open-graph-image | Service Areas | openGraphImage | og-image | 1.91:1 | 1200x630 | Ice rink rental service area planning | ice-service-areas-og-1200x630.jpg | yes | yes | null | needs-upload | yes | Required before production social previews. |

## Brand/Logo Slot

| Media Slot ID | Page | Section ID | Usage Type | Aspect Ratio | Recommended Dimensions | Required Alt Text | Suggested Filename | Required Before CMS Import | Required Before Production | MediaAsset ID | Upload Status | Blocker | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ice-brand-logo | Theme/Header/Footer | brandLogo | icon | flexible | SVG not allowed for upload; use PNG/WebP until SVG sanitizer exists | IceSkatingRinkRentals.com | ice-brand-logo.png | no | yes | null | needs-upload | production | Current fallback text navigation can render without a logo, but final brand review should decide whether a logo media asset is needed. |

## Upload Rules

- Use tenantId `ice-rink-rentals`.
- Use siteKey `ice-rink-rentals`.
- Upload JPEG, PNG, or WebP only.
- Reject SVG until sanitized SVG support exists.
- Require active MediaAsset status before CMS import or production use.
- Confirm license/source/credit before production.
- Keep archived, replaced, and deleted-pending assets out of production-bound pages.
