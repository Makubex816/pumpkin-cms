# Stripped Fields Audit

Previous blocker:
- The Phase 8N local draft overwrite authenticated and wrote the homepage draft, but active readback did not preserve production-renderer metadata.
- The affected readback artifact is `content-review/ice-homepage-phase8n-local-draft-overwrite/phase8n-homepage-readback.json`.

Observed stripped groups:
- Block `content.sectionVariant` values such as `heroMedia`, `trustBand`, `mediaUseCaseGrid`, `splitFeature`, `processSteps`, `planningTopics`, `serviceAreaTeaser`, `faqAccordion`, and `finalCta`.
- Block media objects and card-level media metadata, including `mediaAssetId`, `assetId`, `publicUrl`, `alt`, `title`, and `caption`.
- Page media slot metadata under `media.featuredImage`, `media.heroImage`, `media.localImage`, `media.closingImage`, `media.openGraphImage`, `media.logo`, `media.setupImage`, and supporting use-case slots.
- Domain routing fields `selectedMailbox`, `selectedMailboxMetadata`, and `publicEmailDisplayPolicy`.

Root cause:
- The admin API deserialized the incoming page through typed .NET `Page` and block content classes.
- Those classes accepted the JSON shape but did not declare or extension-preserve the Phase 8N production fields.
- The old .NET round-trip check compared the model after the first lossy deserialize to itself, so it could report `RoundTripOk` while candidate fields had already been dropped.

Current status:
- The contract now preserves these fields at the typed model boundary.
- The contract tool now compares raw candidate JSON to the post-.NET canonical JSON for the canonical persistence paths.
- No CMS rewrite was performed in this repair run, so the old active readback remains stripped until a future authorized reimport.

