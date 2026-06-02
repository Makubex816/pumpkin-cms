# Current Draft Comparison

Current draft readback artifact: `content-review/ice-homepage-local-draft-import/homepage-local-draft-imported-readback.json`

Authenticated API readback: skipped because admin auth was missing. A public/read-only API page probe returned HTTP 400, so no live draft comparison was fetched from the API.

Current artifact summary:

- Wrapper route: `/`
- Page summary route: ``
- Page slug: `home`
- Import previously performed: yes
- Revision rollback available in artifact: yes
- Current block count: 10
- Current customHtml blocks: 3
- Current formBlock blocks: 1

Current artifact block summary:

- Hero (): Portable ice skating rink rentals for unforgettable events
- TrustBar ()
- CardGrid (): Where our mobile rinks fit best
- customHtml / split-feature ()
- HowItWorks (): How the mobile rink rental process works
- customHtml / event-card-grid ()
- customHtml / split-feature ()
- FAQ (): Frequently asked questions
- formBlock (): Request an ice skating rink rental quote
- PrimaryCTA (): Ready to bring ice skating to your event?

Phase 8N normalized block summary:

- Hero / heroMedia (homepage-hero-media): Portable Ice Rink Rentals for Events Across the United States
- TrustBar / trustBand (homepage-trust-band): A mobile rink attraction for private, public, and business events
- CardGrid / mediaUseCaseGrid (homepage-use-case-media-grid): Real event settings, flexible rink planning
- CardGrid / splitFeature (homepage-split-feature-setup): Built around your surface, schedule, and guest flow
- HowItWorks / processSteps (homepage-process-steps): How the mobile rink rental process works
- CardGrid / planningTopics (homepage-planning-topics): Details to review before your rink rental
- ServiceAreaMap / serviceAreaTeaser (homepage-service-area-teaser): Serving event routes across the United States
- FAQ / faqAccordion (homepage-faq-accordion): Portable ice rink rental FAQs
- PrimaryCTA / finalCta (homepage-final-cta): Ready to plan your ice rink rental?

Comparison:

- Hero: Phase 8N uses the CRM headline `Portable Ice Rink Rentals for Events Across the United States` and visible WinterFest MediaAsset image.
- Image/media placement: Phase 8N binds all five official MediaAsset ids and visibly places hero, corporate, holiday, and setup/logistics images.
- Section structure: Phase 8N uses 9 production renderer variants and no customHtml sections; the current local draft artifact uses older mixed sections including customHtml/formBlock content.
- Mobile-first readiness: Phase 8N is normalized to semantic production renderer sections and the Ice `ice-*` class kit.
- CTA links: Phase 8N routes quote CTAs to `/contact` and service planning to `/service-areas`.
- Email/contact policy: Phase 8N keeps public email and phone hidden; selected mailbox remains metadata only.
- Service-area wording: Phase 8N uses domestic United States wording and creates no city page.
- SEO/meta/schema: Phase 8N carries CRM scaffold SEO copy but normalized draft keeps production schema/indexing disabled until approvals.
- Production renderer compatibility: Phase 8N passes local renderer/preflight checks.
