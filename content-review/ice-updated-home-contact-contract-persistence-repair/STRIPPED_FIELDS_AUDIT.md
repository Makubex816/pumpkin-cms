# Stripped Fields Audit

This audit compares the normalized candidate package against the post-import readbacks from the last local draft import. It identifies fields that existed before import but were absent or downgraded after readback.

## Homepage Domain Routing

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

## Contact Domain Routing

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

## Homepage Page-Level Media

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

## Contact Page-Level Media

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

## Homepage Block Variants

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

## Contact Block Variants

| index | type | id | candidate_sectionVariant | readback_sectionVariant | candidate_variant | readback_variant | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Hero | contact-hero-media | heroMedia | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 1 | TrustBar | contact-request-checklist | trustBand | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 2 | CardGrid | contact-quote-context | splitFeature | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 3 | formBlock | contact-quote-form | (missing) | (missing) | quote-form-panel | quote-form-panel | matched |
| 4 | HowItWorks | contact-after-submit-process | processSteps | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 5 | CardGrid | contact-event-types | mediaUseCaseGrid | (missing) | event-card-grid | (missing) | missing-or-changed-in-readback |
| 6 | CardGrid | contact-about-ice-rink-rentals | planningTopics | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 7 | PrimaryCTA | contact-partner-referral | trustBand | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 8 | FAQ | contact-faq-accordion | faqAccordion | (missing) | (missing) | (missing) | missing-or-changed-in-readback |
| 9 | PrimaryCTA | contact-final-cta | finalCta | (missing) | (missing) | (missing) | missing-or-changed-in-readback |

## Contact Form Persistence Fields

| field | candidate | readback | status |
| --- | --- | --- | --- |
| formKey | default-quote-request | default-quote-request | matched |
| sourcePage | /contact | /contact | matched |
| staticEndpointRef | ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT | ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT | matched |
| leadRecipientRef | ICE_RINK_RENTALS_LEAD_RECIPIENT | ICE_RINK_RENTALS_LEAD_RECIPIENT | matched |
| selectedMailboxMetadata | contact@iceskatingrinkrentals.com | (missing) | missing-in-readback |
| emailSendingEnabled | false | (missing) | missing-in-readback |

## Interpretation

The candidate data was not missing the disputed fields. The earlier readback lost explicit domain routing fields on both pages, page-level `mediaAssetId` values on media slots, additional homepage media slots, block variant metadata, and block-level media references. Contact retained the core form routing refs but dropped `selectedMailboxMetadata` and `emailSendingEnabled`.
