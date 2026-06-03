# Phase 8K to Phase 10A Mapping

| Phase 8K source | Current Pumpkin section/variant | Notes |
| --- | --- | --- |
| hero | Hero / heroMedia | Copy and hero image preserved with official MediaAsset id. |
| partnerStrip | TrustBar / trustBand | PPEC top strip preserved; logo represented by media requirement. |
| eventFits | CardGrid / mediaUseCaseGrid | Three image cards preserved with official MediaAsset ids. |
| process | HowItWorks / processSteps | Four numberless/icon process steps preserved. |
| rentalOptions bullets | CardGrid / planningTopics | Bullets converted to renderer-compatible planning topics. |
| rentalOptions | CardGrid / splitFeature | Setup/logistics split-feature preserved with setup MediaAsset. |
| corporate | CardGrid / splitFeature | Corporate section preserved with corporate MediaAsset. |
| publicSpaces | CardGrid / splitFeature | Public/holiday section preserved with holiday MediaAsset. |
| serviceAreas | ServiceAreaMap / serviceAreaTeaser | Section order preserved; generic regional scope corrected to domestic USA. |
| partnerBanner | PrimaryCTA / partnerCta | PPEC deep banner preserved; logo represented by media requirement. |
| faq | FAQ / faqAccordion | FAQ items preserved. |
| quoteForm | formBlock / quote-form-panel | Old WordPress runtime removed; native Pumpkin form routing used. |
| finalCta | PrimaryCTA / finalCta | CTA preserved; public email link removed under form-first policy. |

## Media mapping

| Phase 8K media | Current MediaAsset id or requirement |
| --- | --- |
| site logo | ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411 |
| winter-fest-ice-rink-rentals | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d |
| corporate-ice-rink-event | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd |
| holiday-shopping-center-rink | ice-rink-rentals-holidayicerink-973ce7691377 |
| portable-rink-setup | ice-rink-rentals-icerinkrentalssetup-113d218572e4 |
| ppec-wordmark-card.png / ppec-icon.png | media requirement `ppecPartnerLogo`, status `needs-upload` |

## Email and form mapping

- Legacy public homepage email references were removed from the candidate.
- Correct selected mailbox metadata is `contact@iceskatingrinkrentals.com`.
- Old form runtime references were converted to native Pumpkin `formBlock` routing through the contact form workflow.
