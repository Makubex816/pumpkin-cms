# Homepage Preview Markers

Date: 2026-06-03

## Sources

| Source | Purpose |
| --- | --- |
| `http://localhost:3002/__preview/ice-rink-rentals/home` | Confirms local preview route is reachable |
| `content-review/ice-ppec-visual-brand-repair/homepage-readback-after-ppec-visual-repair.json` | Confirms draft CMS payload markers persisted after PPEC visual repair |

## Preview Route Response

| Marker | Result | Notes |
| --- | --- | --- |
| HTTP 200 | Pass | Preview route responded successfully |
| Client preview shell | Pass | Manual JWT browser loading is required |
| `Party Pros East Coast` in raw shell | Not detected | Expected for client shell; verify through readback and browser preview |
| PPEC logo ID in raw shell | Not detected | Expected for client shell; verify through readback and browser preview |
| `contactus@` absent | Pass | No legacy mailbox was detected in the shell response |

## Readback Artifact Marker Results

| Marker | Result |
| --- | --- |
| `Party Pros East Coast` | Pass |
| PPEC partner section/callout | Pass |
| PPEC logo MediaAsset ID `ice-rink-rentals-ppec-wordmark-card-d28c10b570d1` | Pass |
| PPEC copy/CTA | Pass |
| `contact@iceskatingrinkrentals.com` metadata | Pass |
| `publicEmailDisplayPolicy` includes `form-first-under-review` | Pass |
| No `contactus@` references | Pass |
| Official homepage MediaAsset IDs present | Pass |
| Production-render fields/variants present | Pass |

## Official Homepage MediaAsset IDs Observed

- `ice-rink-rentals-corporateicerinkrentalevent-18e985ca59bd`
- `ice-rink-rentals-holidayicerink-973ce7691377`
- `ice-rink-rentals-icerinkrentalssetup-113d218572e4`
- `ice-rink-rentals-iceskatingrinkrentalslogo-0d1f970f0411`
- `ice-rink-rentals-ppec-wordmark-card-d28c10b570d1`
- `ice-rink-rentals-winterfesticerinkrentals-324b1b89777d`

## Production Render Variants Observed

- `heroMedia`
- `trustBand`
- `mediaUseCaseGrid`
- `processSteps`
- `planningTopics`
- `splitFeature`
- `serviceAreaTeaser`
- `ppecPartnerBand`
- `faqAccordion`
- `quote-form-panel`
- `finalCta`

PPEC verification status: ready for manual browser visual approval, with the preview route loaded using the local admin JWT.

