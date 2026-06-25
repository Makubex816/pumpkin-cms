import type { IHtmlBlock, Page, PageDomainRouting, PageFormConfig, PageMedia } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import {
  ICE_EXISTING_AZURE_MEDIA_ASSETS,
  ICE_PUBLIC_CONTACT_EMAIL,
  iceMedia,
} from './ice-rink-media';

const PAGE_DATE = '2026-06-25T00:00:00Z';

function pageUrl(site: ResolvedSite, slug: string) {
  return !slug || slug === 'home' ? `${site.canonicalUrl}/` : `${site.canonicalUrl}/${slug}`;
}

function tenantId(site: ResolvedSite) {
  return site.tenantId || site.key;
}

function domainRouting(site: ResolvedSite, mode = 'manual_review_then_provider_match'): PageDomainRouting {
  return {
    domain: site.domain,
    brandName: site.brand,
    businessDisplayName: site.legalName,
    publicContactEmail: ICE_PUBLIC_CONTACT_EMAIL,
    publicEmailDisplayPolicy: 'public_display_and_mailto_links_only',
    selectedMailbox: ICE_PUBLIC_CONTACT_EMAIL,
    selectedMailboxMetadata: ICE_PUBLIC_CONTACT_EMAIL,
    quoteRequestEmail: '',
    supportEmail: '',
    replyToEmail: '',
    fromName: site.brand,
    fromEmail: '',
    contactPageSlug: 'contact',
    primaryPhone: '',
    mailtoLinksEnabled: true,
    defaultLeadRoutingMode: mode,
    defaultRecipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    emailProvider: '',
    emailProviderStatus: 'not_configured_public_mailto_only',
    mxStatus: 'not_checked_in_v2_8_19f',
    spfStatus: 'not_checked_in_v2_8_19f',
    dkimStatus: 'not_checked_in_v2_8_19f',
    dmarcStatus: 'not_checked_in_v2_8_19f',
    notes: 'Non-secret public contact metadata only. Backend recipient remains untouched.',
  };
}

function formConfig(formId: string, conversionGoal: string): PageFormConfig {
  return {
    formId,
    formType: 'quote_request',
    conversionGoal,
    routingMode: 'manual_review_then_provider_match',
    domainRoutingKey: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    replyToMode: 'submitter_email',
    emailSubjectTemplate: 'Portable ice rink rental quote request',
    mailtoFallbackEnabled: true,
    thankYouUrl: '/contact',
    thankYouMessage: 'Thank you. Your ice rink rental request has been received for review.',
    recipientGroup: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
    staticFormEndpointKey: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
    normalizedFieldMap: {
      name: 'fullName',
      email: 'email',
      phone: 'phone',
      eventLocation: 'eventCityState',
      eventDate: 'eventDateOrDateRange',
      message: 'message',
    },
    requiresConsent: true,
    consentRequired: true,
    spamProtectionRequired: true,
    spamProtectionEnabled: true,
  };
}

function seo(site: ResolvedSite, slug: string, title: string, description: string, imageKey = 'winterFest') {
  const url = pageUrl(site, slug);
  const image = ICE_EXISTING_AZURE_MEDIA_ASSETS[imageKey as keyof typeof ICE_EXISTING_AZURE_MEDIA_ASSETS];

  return {
    metaTitle: title,
    metaDescription: description,
    keywords: [
      'portable ice rink rentals',
      'temporary ice rink rentals',
      'ice rink rental quote',
      'holiday ice rink rental',
    ],
    robots: 'noindex, nofollow',
    canonicalUrl: url,
    alternateUrls: [],
    structuredData: [],
    openGraph: {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': url,
      'og:image': image.publicUrl,
      'og:image:alt': image.alt,
      'og:site_name': site.brand,
      'og:locale': 'en_US',
    },
    twitterCard: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image.publicUrl,
      'twitter:site': '',
      'twitter:creator': '',
    },
  };
}

function basePage(
  site: ResolvedSite,
  slug: string,
  title: string,
  description: string,
  keyword: string,
  blocks: IHtmlBlock[],
  imageKey: keyof typeof ICE_EXISTING_AZURE_MEDIA_ASSETS,
  pageType = 'landing'
): Page {
  return {
    id: `${site.key}-recovered-${slug}`,
    PageId: `${site.key}-recovered-${slug}`,
    tenantId: tenantId(site),
    pageSlug: slug,
    PageVersion: 19,
    Layout: 'default',
    MetaData: {
      category: 'rentals',
      product: site.product.singular,
      keyword,
      pageType,
      title,
      description,
      createdAt: PAGE_DATE,
      updatedAt: PAGE_DATE,
      author: `${site.brand} Team`,
      language: 'en-us',
      market: 'us',
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword,
      tags: ['portable ice rink rentals', 'ice rink rentals', 'temporary rink rental', 'event rentals'],
      contentSummary: description,
      blockTypes: blocks.map((block) => block.type),
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: {
      isHub: slug === 'home',
      hubPageSlug: slug === 'home' ? '' : 'home',
      topicCluster: 'ice-rink-rentals',
      relatedHubs: [],
      spokePriority: slug === 'home' ? 0 : slug === 'service-areas' ? 1 : 2,
    },
    seo: seo(site, slug, title, description, imageKey),
    isPublished: true,
    publishedAt: PAGE_DATE,
    includeInSitemap: true,
    media: pageMedia(imageKey),
    formConfig: formConfig(
      slug === 'contact' ? 'ice-rink-rentals-default-quote-request' : `ice-rink-rentals-${slug}-quote-routing`,
      slug === 'service-areas' ? 'service_area_quote_request' : 'contact_quote_form_submit'
    ),
    formDefinitions: [],
    domainRouting: domainRouting(site),
    workflow: {
      status: 'local_rebuild_needs_isolated_staging_review',
      reviewStatus: 'needs_visual_owner_review',
      approvedForPublish: false,
      approvedBy: '',
      approvedAt: '',
      lastEditedBy: 'codex_v2_8_19f',
      lastEditedAt: PAGE_DATE,
    },
    staticPublishing: {
      staticEligible: false,
      needsRebuild: true,
      lastSnapshotAt: '',
      lastStaticBuildAt: '',
      lastDeployedAt: '',
      contentHash: '',
      lastPublishedContentHash: '',
      deploymentStatus: 'local_rebuild_only_no_deploy',
    },
    template: {
      templateKey: `ice-${slug}-v2-8-19f-existing-azure-media`,
      templateVersion: 'v2-8-19f',
      layoutVariant: 'existing-azure-media-local-rebuild',
      contentModelVersion: '2026-06',
    },
    pageQuality: {
      status: 'needs_isolated_staging_visual_review',
      warnings: ['Local rebuild only. Production and isolated staging deploys require separate approval.'],
      blockingIssues: [],
      lastCheckedAt: PAGE_DATE,
      buyerIntent: keyword,
      landingPageType: pageType,
      launchNotes: 'Do not deploy or index before isolated staging visual approval.',
    },
  };
}

function pageMedia(heroKey: keyof typeof ICE_EXISTING_AZURE_MEDIA_ASSETS): PageMedia {
  return {
    featuredImage: iceMedia(heroKey, 'featured-image'),
    heroImage: iceMedia(heroKey, 'hero-image'),
    localImage: iceMedia('corporateEvent', 'local-image'),
    closingImage: iceMedia('holidayRink', 'closing-image'),
    openGraphImage: iceMedia(heroKey, 'open-graph-image'),
    logo: iceMedia('siteLogo', 'logo'),
    setupImage: iceMedia('setupLogistics', 'setup-image'),
    ppecPartnerLogo: iceMedia('ppecLogo', 'partner-logo'),
  };
}

function heroBlock(content: Record<string, unknown>): IHtmlBlock {
  return {
    type: 'Hero',
    id: String(content.id ?? 'hero'),
    enabled: true,
    content: {
      sectionVariant: 'heroMedia',
      type: 'Main',
      ...content,
    },
  };
}

function trustBand(items: Array<{ icon: string; title: string; text: string }>): IHtmlBlock {
  return {
    type: 'TrustBar',
    content: {
      sectionVariant: 'trustBand',
      items: items.map((item) => ({ ...item, alt: item.title })),
    },
  };
}

function mediaGrid(title: string, subtitle: string, cards: Array<Record<string, unknown>>): IHtmlBlock {
  return {
    type: 'CardGrid',
    content: {
      sectionVariant: 'mediaUseCaseGrid',
      title,
      subtitle,
      cards,
    },
  };
}

function splitFeature(content: Record<string, unknown>): IHtmlBlock {
  return {
    type: 'CardGrid',
    content: {
      sectionVariant: 'splitFeature',
      ...content,
    },
  };
}

function planningTopics(title: string, subtitle: string, topics: Array<{ title: string; description: string }>): IHtmlBlock {
  return {
    type: 'CardGrid',
    content: {
      sectionVariant: 'planningTopics',
      title,
      subtitle,
      topics,
    },
  };
}

function processSteps(title: string, subtitle: string, steps: Array<{ title: string; text: string }>): IHtmlBlock {
  return {
    type: 'HowItWorks',
    content: {
      sectionVariant: 'processSteps',
      title,
      subtitle,
      steps,
    },
  };
}

function faq(title: string, subtitle: string, items: Array<{ question: string; answer: string }>): IHtmlBlock {
  return {
    type: 'FAQ',
    content: {
      sectionVariant: 'faqAccordion',
      title,
      subtitle,
      items,
    },
  };
}

function finalCta(title: string, description: string, buttonText: string, buttonLink = '/contact'): IHtmlBlock {
  return {
    type: 'PrimaryCTA',
    content: {
      sectionVariant: 'finalCta',
      eyebrow: 'Next step',
      title,
      description,
      buttonText,
      buttonLink,
    },
  };
}

function ppecPartnerBlock(secondaryButtonText = 'Request a Rink Quote'): IHtmlBlock {
  return {
    type: 'PrimaryCTA',
    content: {
      sectionVariant: 'ppecPartnerBand',
      eyebrow: 'Event rental partner',
      headline: 'Planning more than the rink?',
      description:
        'Ice Skating Rink Rentals can keep the rink conversation focused. Party Pros East Coast may be a helpful partner resource for broader event rentals, attractions, concessions, and entertainment planning.',
      partnerCtaLabel: 'Explore Party Pros East Coast',
      secondaryButtonText,
      secondaryButtonLink: '/contact',
      cta: {
        label: 'Explore Party Pros East Coast',
        href: 'https://partyproseastcoast.com/',
      },
      partner: {
        name: 'Party Pros East Coast',
        displayRole: 'Event rental partner resource',
        url: 'https://partyproseastcoast.com/',
        urlSource: 'v2-8-19f-existing-azure-media-source-integration',
        logoMedia: iceMedia('ppecLogo', 'partner-logo'),
      },
    },
  };
}

function contactBlock(): IHtmlBlock {
  return {
    type: 'Contact',
    id: 'contact',
    content: {
      id: 'contact',
      title: 'Start your quote request',
      subtitle:
        'Share the event date, location, venue type, guest count, surface details, rental goals, and support needs so the rental conversation starts clearly.',
      address: '',
      phone: '',
      email: ICE_PUBLIC_CONTACT_EMAIL,
      hours: 'Requests are reviewed by event date, location, season, and venue readiness.',
      formFields: [
        { label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
        { label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
        { label: 'Phone', type: 'tel', required: false, placeholder: 'Best callback number' },
        { label: 'Event Date', type: 'text', required: true, placeholder: 'Preferred date or date range' },
        { label: 'Event Location', type: 'text', required: true, placeholder: 'City, state, and venue' },
        { label: 'Venue Type', type: 'text', required: false, placeholder: 'School, town center, mall, venue, private property' },
        { label: 'Estimated Attendance', type: 'text', required: false, placeholder: 'Expected guest count' },
        { label: 'Surface Details', type: 'textarea', required: false, placeholder: 'Indoor/outdoor, surface type, available space, access notes' },
        { label: 'Rental Goals', type: 'textarea', required: true, placeholder: 'Tell us about timing, add-ons, and the experience you want to create' },
      ],
      submitButtonText: 'Send Quote Request',
      socialLinks: [],
    },
  };
}

export function getIceRinkRecoveredHome(site: ResolvedSite): Page {
  const title = 'Portable Ice Skating Rink Rentals for Events';
  const description =
    'Rent a portable ice skating rink for private events, corporate activations, holiday festivals, schools, shopping centers, and event route planning.';

  return basePage(
    site,
    'home',
    title,
    description,
    'portable ice skating rink rentals',
    [
      heroBlock({
        id: 'home-hero-media',
        eyebrow: 'Portable rink planning',
        headline: title,
        subheadline:
          'Bring a polished skating experience to seasonal programs, town events, campuses, venues, and private celebrations with a quote path built around dates, location, guest flow, and site readiness.',
        buttonText: 'Request a Quote',
        buttonLink: '/contact',
        secondaryButtonText: 'View Service Areas',
        secondaryButtonLink: '/service-areas',
        media: iceMedia('winterFest', 'home-hero'),
      }),
      trustBand([
        { icon: 'CalendarCheck', title: 'Date-first planning', text: 'Availability depends on timing, season, and setup windows.' },
        { icon: 'MapPin', title: 'Venue fit review', text: 'Location, surface, access, and guest flow shape the quote path.' },
        { icon: 'ClipboardCheck', title: 'Clear quote intake', text: 'The contact route asks for details that help avoid vague estimates.' },
        { icon: 'ShieldCheck', title: 'No unsupported claims', text: 'Final coverage and availability are confirmed through review.' },
      ]),
      mediaGrid('Portable rinks for moments people remember', 'Route prospects by event type, venue needs, and setup expectations.', [
        {
          title: 'Holiday markets and winter villages',
          description: 'Plan a central attraction for seasonal programs, shopping districts, outdoor plazas, and destination events.',
          media: iceMedia('holidayRink', 'home-holiday-card'),
          ctaHref: '/contact',
          ctaLabel: 'Start planning',
        },
        {
          title: 'Corporate and VIP activations',
          description: 'Create a branded or bookable experience when space, schedule, and site logistics can support the rental.',
          media: iceMedia('corporateEvent', 'home-corporate-card'),
          ctaHref: '/contact',
          ctaLabel: 'Request review',
        },
        {
          title: 'Setup-ready venues',
          description: 'Review surface, access, power, load-in, guest flow, and support needs before the quote conversation.',
          media: iceMedia('setupLogistics', 'home-setup-card'),
          ctaHref: '/service-areas',
          ctaLabel: 'Review fit',
        },
      ]),
      splitFeature({
        eyebrow: 'Venue fit',
        title: 'Make the rink feel intentional before the first quote call',
        description:
          'Great temporary ice rink events start with clear event goals, realistic venue details, and a request that gives the rental team enough context to evaluate fit.',
        image: iceMedia('setupLogistics', 'home-setup-feature'),
        bullets: [
          'Preferred date or date range',
          'City, state, venue, and surface type',
          'Indoor, outdoor, covered, or exposed placement',
          'Expected attendance and operating hours',
        ],
      }),
      ppecPartnerBlock(),
      faq('Portable ice rink rental questions', 'A few clear answers before the quote request.', [
        {
          question: 'What details should I send first?',
          answer:
            'Send the event date or date range, city and state, venue type, indoor or outdoor placement, expected attendance, available space, and access constraints.',
        },
        {
          question: 'Can the site promise service in my city?',
          answer:
            'Final availability should be confirmed through quote review. The launch copy avoids unsupported city or region claims until coverage is approved.',
        },
        {
          question: 'Can portable rinks work indoors and outdoors?',
          answer:
            'Both may be possible depending on venue surface, access, weather exposure, power, setup windows, and event requirements.',
        },
      ]),
      finalCta(
        'Ready to plan a portable ice rink rental?',
        'Send the basics through the quote page so availability and fit can be reviewed against your event details.',
        'Request a Quote'
      ),
    ],
    'winterFest',
    'home'
  );
}

export function getIceRinkRecoveredServiceAreas(site: ResolvedSite): Page {
  return basePage(
    site,
    'service-areas',
    'Portable Ice Rink Rental Service Areas',
    'Review portable ice rink rental service-area planning across the United States and request availability review for your event city, date, venue, and support needs.',
    'portable ice rink rental service areas',
    [
      heroBlock({
        id: 'service-areas-hero-media',
        eyebrow: 'Portable ice rink rental service areas',
        headline: 'Portable ice rink rental service areas across the United States',
        subheadline:
          'Ice Skating Rink Rentals reviews portable rink rental requests using event details, venue logistics, timing, and route feasibility before availability is confirmed.',
        buttonText: 'Request a Quote',
        buttonLink: '/contact',
        media: iceMedia('winterFest', 'service-area-hero'),
      }),
      trustBand([
        { icon: 'MapPinned', title: 'United States review', text: 'Event requests may be submitted from across the United States and reviewed before availability is represented.' },
        { icon: 'ClipboardCheck', title: 'Quote-first planning', text: 'The team reviews date, location, access, surface, support needs, and package fit.' },
        { icon: 'PackageCheck', title: 'Route-based logistics', text: 'Delivery access, setup area, guest flow, and event duration all affect fit.' },
      ]),
      planningTopics('Portable rink requests by region', 'Use this page to guide visitors toward quote review while avoiding unsupported city claims.', [
        { title: 'Northeast and Mid-Atlantic', description: 'Submit city, state, date, and venue details so the request can be reviewed without assuming local availability.' },
        { title: 'Southeast', description: 'Holiday attractions, resorts, retail centers, festivals, and private venues can be reviewed through the quote path.' },
        { title: 'Midwest', description: 'Winter festivals, colleges, municipalities, and corporate holiday events can be assessed around route feasibility.' },
        { title: 'Mountain West and West Coast', description: 'Long-distance requests require careful review of delivery route, setup window, and venue readiness.' },
      ]),
      processSteps('What we review before confirming a route', 'A strong service-area request includes enough details to understand venue, timing, route, surface, and guest-support needs.', [
        { title: 'Event city, state, and date', text: 'The location, event window, and target date help determine whether the request can be reviewed for that market.' },
        { title: 'Venue access and surface', text: 'Delivery access, surface type, footprint, power, weather exposure, and guest flow all affect setup recommendations.' },
        { title: 'Rink package and support needs', text: 'Skates, skate aids, benches, barriers, lighting, music, signage, staffing, and add-ons can be included in the review.' },
        { title: 'Quote path and next step', text: 'After details are reviewed, the team can respond with availability direction, package planning, and follow-up questions if needed.' },
      ]),
      splitFeature({
        eyebrow: 'Setup logistics',
        title: 'Portable rink routes depend on more than distance',
        description:
          'A portable ice rink request is reviewed around event footprint, delivery route, timing, power access, weather exposure, and support needs before availability is represented publicly.',
        image: iceMedia('setupLogistics', 'service-area-setup-feature'),
        bullets: [
          'Venue access and delivery window',
          'Surface type, footprint, and guest flow',
          'Event duration and weather exposure',
          'Support items requested with the rink',
        ],
      }),
      ppecPartnerBlock('Request Rink Availability Review'),
      splitFeature({
        eyebrow: 'Best-fit events',
        title: 'Requests that travel well',
        description:
          'The strongest service-area requests usually have a defined venue, a clear event date, a realistic setup area, and enough attendance detail to match the rink plan to the guest experience.',
        image: iceMedia('holidayRink', 'service-area-event-feature'),
        bullets: [
          'Holiday markets and winter villages',
          'Corporate campuses and VIP events',
          'Shopping centers and mixed-use developments',
          'Municipal programming and town events',
        ],
      }),
      faq('Service area FAQs', 'Service-area copy stays quote-first until market details are approved.', [
        {
          question: 'Do you serve my state?',
          answer:
            'Ice Skating Rink Rentals reviews requests across the United States. Availability depends on event date, location, venue access, staffing, package needs, and route feasibility.',
        },
        {
          question: 'Why are city pages not listed yet?',
          answer:
            'City and regional pages should only be published after each market is reviewed and approved, which avoids unsupported local claims.',
        },
        {
          question: 'What details help determine availability?',
          answer:
            'Helpful details include event date, city and state, venue type, available surface, estimated attendance, event duration, delivery access, and support needs.',
        },
      ]),
      finalCta(
        'Ready to check availability for your event location?',
        'Share your city, state, event date, venue details, available surface, estimated attendance, and event goals.',
        'Request Service-Area Review'
      ),
    ],
    'winterFest',
    'serviceAreas'
  );
}

export function getIceRinkRecoveredContact(site: ResolvedSite): Page {
  return basePage(
    site,
    'contact',
    'Request an Ice Rink Rental Quote',
    'Request a portable ice rink rental quote for corporate events, holiday activations, schools, municipalities, shopping centers, private venues, and public events.',
    'ice rink rental quote',
    [
      heroBlock({
        id: 'contact-hero-media',
        eyebrow: 'Quote planning for portable ice rink events',
        headline: 'Request an Ice Rink Rental Quote',
        subheadline:
          'Tell us where, when, and how you want guests to skate. Ice Skating Rink Rentals reviews location, date, venue, surface, guest count, and support needs so the next step starts with the right details.',
        buttonText: 'Start Your Quote Request',
        buttonLink: '#contact',
        secondaryButtonText: 'View Service Areas',
        secondaryButtonLink: '/service-areas',
        media: iceMedia('contactPlanningHero', 'contact-hero'),
      }),
      trustBand([
        { icon: 'MapPin', title: 'Location and timing', text: 'Share the event city, state, preferred date, event window, and venue timing details.' },
        { icon: 'Ruler', title: 'Surface and access', text: 'Describe the surface, approximate footprint, loading access, indoor or outdoor setting, and power notes.' },
        { icon: 'Users', title: 'Guest experience', text: 'Include guest count, event goals, rink role, and support needs such as skates, aids, lighting, or staffing.' },
      ]),
      splitFeature({
        eyebrow: 'Start your request',
        title: 'Share the details that shape a better quote',
        description:
          'Use the quote request form to send the event basics. Even if every detail is not final yet, the date, city, venue type, guest count, surface notes, and goals help determine fit.',
        image: iceMedia('contactQuotePlanning', 'contact-quote-planning'),
        bullets: [
          'Event city, state, date, and venue type',
          'Surface, space, access, and timing notes',
          'Guest count, event goals, and support needs',
          'Public contact email: contact@iceskatingrinkrentals.com',
        ],
      }),
      contactBlock(),
      planningTopics('What to include in your request', 'A complete request gives the team a clearer starting point for availability, route review, and setup requirements.', [
        { title: 'Event date and hours', description: 'Share the event date, backup dates, setup window, operating hours, and teardown expectations.' },
        { title: 'City, state, and venue', description: 'Include the city, state, venue type, site access notes, and whether the event is private, public, or ticketed.' },
        { title: 'Surface and access', description: 'Describe the surface, approximate footprint, slope concerns, load-in path, power access, and nearby constraints.' },
        { title: 'Guest count and flow', description: 'Estimate attendance, participant volume, age range, and whether skating is the main attraction or part of a larger event.' },
      ]),
      splitFeature({
        eyebrow: 'After you submit',
        title: 'A clear review process for your event',
        description:
          'Your request is reviewed around practical details that determine whether a portable rink is a strong fit for the event, site, and timeline.',
        image: iceMedia('contactSetupLogistics', 'contact-setup-logistics'),
        bullets: [
          'Request details received',
          'Site fit reviewed',
          'Planning questions refined',
          'Next-step quote plan prepared',
        ],
      }),
      mediaGrid('Requests we commonly review', 'Portable ice rink rentals can support a wide range of customer and business event goals.', [
        {
          title: 'Holiday activations',
          description: 'Winter festivals, seasonal attractions, tree lightings, and family-friendly public events.',
          media: iceMedia('winterFest', 'contact-event-holiday'),
        },
        {
          title: 'Corporate and VIP events',
          description: 'Employee appreciation, client entertainment, branded experiences, and networking events.',
          media: iceMedia('corporateEvent', 'contact-event-corporate'),
        },
        {
          title: 'Shopping centers and venues',
          description: 'Retail centers, mixed-use developments, town centers, resorts, hotels, and destination-style winter attractions.',
          media: iceMedia('holidayRink', 'contact-event-venue'),
        },
      ]),
      ppecPartnerBlock('Continue Quote Request'),
      faq('Ice rink rental quote FAQs', 'These answers help set expectations before the rental team follows up.', [
        {
          question: 'What information is most important for a quote?',
          answer:
            'Event date, city and state, venue type, indoor or outdoor setting, available space, guest count, surface notes, rental duration, and desired add-ons are the most helpful starting details.',
        },
        {
          question: 'Can I request pricing before every detail is final?',
          answer:
            'Yes. Early details can begin the review process, and the scope can be refined as the venue, timing, and support needs become clearer.',
        },
        {
          question: 'Can portable rinks be reviewed for indoor and outdoor events?',
          answer:
            'Yes. Indoor and outdoor setups can both be reviewed, but surface, access, available space, weather exposure, and venue rules matter.',
        },
      ]),
      finalCta(
        'Ready to bring skating to your event?',
        'Send your event location, date, venue details, estimated attendance, and goals so the request can be reviewed.',
        'Start Your Quote Request',
        '#contact'
      ),
    ],
    'contactPlanningHero',
    'contact'
  );
}

export function getIceRinkRecoveredPage(site: ResolvedSite, slug: string): Page | null {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '').toLowerCase();

  if (!normalizedSlug || normalizedSlug === 'home') return getIceRinkRecoveredHome(site);
  if (normalizedSlug === 'service-areas') return getIceRinkRecoveredServiceAreas(site);
  if (normalizedSlug === 'contact') return getIceRinkRecoveredContact(site);

  return null;
}
