# Phase 8K Approved Homepage Audit

## Approved section order

1. hero
2. partnerStrip
3. eventFits
4. process
5. rentalOptions
6. corporate
7. publicSpaces
8. serviceAreas
9. partnerBanner
10. faq
11. quoteForm
12. finalCta

## Hero layout

- Eyebrow: Mobile ice skating rink rentals for private, public, and corporate events
- H1: Portable ice skating rink rentals for unforgettable events
- Media: `winter-fest-ice-rink-rentals`
- Primary CTA: Request a Quote
- Secondary CTA: View Rental Options
- Conversion: mapped to `Hero` with `sectionVariant: heroMedia` and official MediaAsset `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`.

## Image/media placement

- Hero/event card image: `winter-fest-ice-rink-rentals` -> `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`
- Corporate image: `corporate-ice-rink-event` -> `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd`
- Setup image: `portable-rink-setup` -> `ice-rink-rentals-icerinkrentalssetup-113d218572e4`
- Holiday/public-space image: `holiday-shopping-center-rink` -> `ice-rink-rentals-holidayicerink-973ce7691377`

## PPEC partner/callout layout

- Top partner strip is preserved after the hero as a `TrustBar` with `sectionVariant: trustBand`.
- Deep partner banner is preserved before FAQ as a `PrimaryCTA` with `sectionVariant: partnerCta`.
- Logo placement remains a partner-logo requirement until a Pumpkin MediaAsset id is uploaded or explicitly waived.

## PPEC CTA text

- Top strip CTA: Ask About Event Support
- Deep banner CTA: Request Ice Rink Rental Info
- Candidate routes both CTAs to the native homepage quote form block instead of old WordPress runtime behavior.

## PPEC colors/style cues

- ppecPurple: `#5F438F`
- ppecPurpleLight: `#7B5EC2`
- ppecHeading: `#39235F`
- ppecBody: `#5E526D`
- ppecSoftBackground: `#F5F0FF`
- ppecBorder: `rgba(95,67,143,.20)`

## Homepage form/CF7 conversion

- Phase 8K quote form area is preserved as a native Pumpkin `formBlock`.
- The old shortcode/runtime is not copied into the candidate.
- The block uses `formKey: default-quote-request`, `variant: quote-form-panel`, `sourcePage: /contact`, and non-secret routing refs.

## Copy preservation

The hero, partner strip, event-fit cards, process steps, rental-options bullets, corporate/public-space copy, PPEC banner copy, FAQ items, quote-form intro, and final CTA copy are carried forward from Phase 8K, with Phase 10A corrections for service scope and email policy.
