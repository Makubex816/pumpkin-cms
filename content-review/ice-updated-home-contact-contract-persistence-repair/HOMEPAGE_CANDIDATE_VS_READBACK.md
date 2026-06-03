# Homepage Candidate vs Readback

## Files

- Candidate: `content-review/ice-updated-home-contact-validated/UPDATED_HOMEPAGE_NORMALIZED_CANDIDATE.json`
- Readback: `content-review/ice-updated-home-contact-local-draft-import/homepage-readback-after-import.json`

## Route

- Candidate slug: `home`
- Readback slug: `home`

## Domain Routing

| field | candidate | readback | status |
| --- | --- | --- | --- |
| domain | iceskatingrinkrentals.com | iceskatingrinkrentals.com | matched |
| publicEmailDisplayPolicy | form-first-under-review | (missing) | missing-in-readback |
| selectedMailbox | contact@iceskatingrinkrentals.com | (missing) | missing-in-readback |
| selectedMailboxMetadata | contact@iceskatingrinkrentals.com | (missing) | missing-in-readback |
| leadRecipientRef | ICE_RINK_RENTALS_LEAD_RECIPIENT | (missing) | missing-in-readback |
| staticEndpointRef | ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT | (missing) | missing-in-readback |
| selectedEmailProvider | under-review | (missing) | missing-in-readback |
| pumpkinAppSendStatus | disabled_review_only | (missing) | missing-in-readback |
| mailtoLinksEnabled | false | false | matched |
| publicContactEmail |  |  | matched |

## Page Media Slots

| slot | candidate_mediaAssetId | readback_mediaAssetId | candidate_assetId | readback_assetId | status |
| --- | --- | --- | --- | --- | --- |
| featuredImage | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | (missing) | winterfesticerinkrentals-324b1b89777d | winterfesticerinkrentals-324b1b89777d | mediaAssetId-missing-in-readback |
| heroImage | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | (missing) | winterfesticerinkrentals-324b1b89777d | winterfesticerinkrentals-324b1b89777d | mediaAssetId-missing-in-readback |
| localImage | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | (missing) | corporateicerinkrentalevent-18e985ca59bd | corporateicerinkrentalevent-18e985ca59bd | mediaAssetId-missing-in-readback |
| closingImage | ice-rink-rentals-holidayicerink-973ce7691377 | (missing) | holidayicerink-973ce7691377 | holidayicerink-973ce7691377 | mediaAssetId-missing-in-readback |
| openGraphImage | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | (missing) | winterfesticerinkrentals-324b1b89777d | (missing) | mediaAssetId-missing-in-readback |
| logo | ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411 | (missing) | iceskatingrinkrentalslogo-0d1f970f0411 | (missing) | slot-missing-in-readback |
| setupImage | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | (missing) | icerinkrentalssetup-113d218572e4 | (missing) | slot-missing-in-readback |
| hero | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | (missing) | winterfesticerinkrentals-324b1b89777d | (missing) | slot-missing-in-readback |
| corporate | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | (missing) | corporateicerinkrentalevent-18e985ca59bd | (missing) | slot-missing-in-readback |
| holiday | ice-rink-rentals-holidayicerink-973ce7691377 | (missing) | holidayicerink-973ce7691377 | (missing) | slot-missing-in-readback |
| setup | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | (missing) | icerinkrentalssetup-113d218572e4 | (missing) | slot-missing-in-readback |
| sourceMediaManifest | (missing) | (missing) | (missing) | (missing) | slot-missing-in-readback |

## Candidate Block Media References

| index | type | id | path | mediaAssetId | assetId |
| --- | --- | --- | --- | --- | --- |
| 0 | Hero | homepage-hero-media | content.media | ice-rink-rentals-winterfesticerinkrentals-324b1b89777d | winterfesticerinkrentals-324b1b89777d |
| 2 | CardGrid | homepage-featured-use-cases | content.cards.0.media | ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd | corporateicerinkrentalevent-18e985ca59bd |
| 2 | CardGrid | homepage-featured-use-cases | content.cards.1.media | ice-rink-rentals-holidayicerink-973ce7691377 | holidayicerink-973ce7691377 |
| 2 | CardGrid | homepage-featured-use-cases | content.cards.2.media | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | icerinkrentalssetup-113d218572e4 |
| 3 | CardGrid | homepage-rental-planning-split-feature | content.media | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | icerinkrentalssetup-113d218572e4 |
| 3 | CardGrid | homepage-rental-planning-split-feature | content.image | ice-rink-rentals-icerinkrentalssetup-113d218572e4 | icerinkrentalssetup-113d218572e4 |

## Readback Block Media References

_None found._

## Block Variants

| index | type | id | candidate_sectionVariant | readback_sectionVariant | candidate_variant | readback_variant | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Hero | homepage-hero-media | heroMedia | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 1 | TrustBar | homepage-event-fit-trust-band | trustBand | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 2 | CardGrid | homepage-featured-use-cases | mediaUseCaseGrid | (missing) | event-card-grid | (missing) | missing-or-changed-in-readback |
| 3 | CardGrid | homepage-rental-planning-split-feature | splitFeature | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 4 | HowItWorks | homepage-process-steps | processSteps | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 5 | CardGrid | homepage-planning-topics | planningTopics | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 6 | PrimaryCTA | homepage-partner-referral | trustBand | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 7 | ServiceAreaMap | homepage-service-area-teaser | serviceAreaTeaser | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 8 | FAQ | homepage-faq-accordion | faqAccordion | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 9 | PrimaryCTA | homepage-final-cta | finalCta | (missing) | (missing) | (missing) | missing-or-changed-in-readback |

## Result

Homepage candidate fields were present before import, including the explicit mailbox/policy values and tenant-prefixed page media identifiers. The readback returned a narrower shape that omitted the updated persistence fields and lost production-render metadata.
