# PPEC Approved Asset and Style Audit

## Asset findings

- `ppec-icon.png` exists: yes
- `ppec-wordmark-card.png` exists: yes
- Approved Pumpkin PPEC MediaAsset id exists: no
- Preferred intake source file: `ppec-wordmark-card.png`

## Media intake requirement

```json
{
  "requiredMediaSlot": "ppecPartnerLogo",
  "requiredMediaSlotId": "ppecPartnerLogo",
  "mediaRequirementRef": "ppec-partner-logo",
  "usageType": "partner-logo",
  "intendedUsageType": "partner-logo",
  "page": "Homepage",
  "sectionId": "homepage-ppec-partner-strip, homepage-ppec-partner-cta",
  "sourceFile": "ppec-wordmark-card.png",
  "sourcePath": "content-review/ice-approved-homepage-conversion-input/extracted/phase8k/ice-homepage-phase8k-cf7-template-pack/assets/ppec-wordmark-card.png",
  "alternateSourceFiles": [
    "ppec-icon.png",
    "ppec-wordmark-card.png"
  ],
  "mediaAssetId": null,
  "assetId": null,
  "status": "needs-upload",
  "title": "Party Pros East Coast Logo",
  "altText": "Party Pros East Coast logo",
  "alt": "Party Pros East Coast logo",
  "requiredBeforeCmsImport": true,
  "requiredBeforeProduction": true,
  "requiredBeforeProductionLabel": "yes",
  "blocker": true,
  "notes": "Source logo file exists, but no approved Pumpkin MediaAsset id is present in the current media manifest."
}
```

## PPEC colors/styles

- ppecPurple: `#5F438F`
- ppecPurpleLight: `#7B5EC2`
- ppecHeading: `#39235F`
- ppecBody: `#5E526D`
- ppecSoftBackground: `#F5F0FF`
- ppecBorder: `rgba(95,67,143,.20)`

Source files:

- `content-review/ice-approved-homepage-conversion-input/extracted/phase8k/ice-homepage-phase8k-cf7-template-pack/ice-homepage.phase8k.design-assets.json`
- `content-review/ice-approved-homepage-conversion-input/extracted/phase8k/ice-homepage-phase8k-cf7-template-pack/ice-homepage.phase8k.preview.html`

## PPEC URL

- URL: https://partyproseastcoast.com/
- Source: phase10a.partnerships.externalUrl
- Production-ready URL: yes

## PPEC CTA copy

- Top partner strip: Ask About Event Support
- Deep partner banner: Request Ice Rink Rental Info

## PPEC logo placement

- Top strip: logo icon to the left of partner copy
- Deep banner: logo icon to the left of deep partner banner copy

## Decision

The PPEC logo source exists, but no approved Pumpkin MediaAsset id exists in the current official media manifest. No MediaAsset record is created in this run. The candidate includes a required media intake object and blocks or conditions local draft import until that logo is uploaded/bound or explicitly waived.
