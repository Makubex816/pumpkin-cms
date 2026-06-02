# Homepage Production Layout Decision

Decision: use existing Pumpkin block types with explicit production sectionVariant contracts rather than creating new block type names.

This keeps the candidate compatible with the existing .NET Page/block contract while giving the Ice renderer first-class production behavior for heroMedia, trustBand, mediaUseCaseGrid, splitFeature, processSteps, planningTopics, serviceAreaTeaser, faqAccordion, and finalCta.

The candidate does not depend on customHtml for layout.
