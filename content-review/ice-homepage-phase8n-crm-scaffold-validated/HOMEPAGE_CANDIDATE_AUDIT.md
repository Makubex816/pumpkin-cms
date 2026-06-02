# Homepage Candidate Audit

Selected candidate: `content-review/ice-homepage-phase8n-crm-scaffold-input/extracted/ice-homepage-phase8n-crm-scaffold/ice-homepage.phase8n.crm-scaffold.full.json`

Reason selected: Package manifest primaryJson; complete homepage scaffold for route / with Ice tenant/site and CRM scaffold metadata.

The package candidate is homepage-only, targets route `/`, uses tenant/site `ice-rink-rentals`, and keeps workflow at draft/needs_review. It is not directly a canonical Pumpkin Page object because its active content is stored under pack-level `blocks`; it was normalized into `ContentData.ContentBlocks` for the production renderer.

Normalized block variants:

1. heroMedia
2. trustBand
3. mediaUseCaseGrid
4. splitFeature
5. processSteps
6. planningTopics
7. serviceAreaTeaser
8. faqAccordion
9. finalCta

Normalization notes:

- The Phase 8N rental-planning section was split into `splitFeature` and `planningTopics` to match the current production renderer/preflight contract.
- Homepage form remains omitted; CTAs route to `/contact`.
- Public email and phone remain hidden.
- No city/location page was created.
