import type { IHtmlBlock, Page } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { replaceSiteTokens } from '@/lib/token-replace';
import { getFallbackHome } from './fallback-home';

const PAGE_DATE = '2026-05-12T00:00:00Z';

const fallbackPageTemplates: Record<string, Page> = {
  'ice-rink-rentals': createPageTemplate({
    slug: 'ice-rink-rentals',
    title: 'Portable Ice Rink Rentals',
    metaTitle: 'Portable Ice Rink Rentals | {{brand}}',
    metaDescription:
      'Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.',
    keyword: 'Portable Ice Rink Rentals',
    summary:
      '{{brand}} helps planners compare portable ice rink rental options, venue requirements, add-ons, setup support, and quote steps.',
    blocks: [
      heroBlock({
        eyebrow: '{{service}}',
        headline: 'Portable Ice Rink Rentals',
        subheadline:
          'Bring a polished winter attraction to school events, corporate parties, town festivals, private celebrations, and seasonal programs with portable rink planning, setup guidance, and quote support.',
        buttonText: 'Get a Quote',
        buttonLink: '/contact',
        secondaryButtonText: 'Plan My Rental',
        secondaryButtonLink: '/contact',
        trustLine: 'Portable rink rentals planned around your event date, venue fit, guest flow, and setup needs.',
      }),
      trustBarBlock([
        ['MapPin', 'Venue Planning', 'Space, surface, access, and layout review'],
        ['Wrench', 'Setup Guidance', 'Practical setup details before quote planning'],
        ['Ruler', 'Event-ready Layout', 'Rink sizing and guest-flow considerations'],
        ['ClipboardCheck', 'Quote Support', 'A clearer path from idea to rental request'],
      ]),
      cardGridBlock({
        title: 'Portable rink rental planning in one place',
        subtitle:
          'Use these sections to understand what affects rink size, setup, staffing, add-ons, and timing before requesting a quote.',
        cards: [
          {
            icon: 'Snowflake',
            title: 'Event types',
            description:
              'Portable rink rentals can support winter festivals, school celebrations, corporate events, holiday parties, and private gatherings.',
            link: '/events-holiday-activations',
          },
          {
            icon: 'Ruler',
            title: 'Rink planning',
            description:
              'Confirm available space, surface type, indoor or outdoor placement, guest count, and how visitors will enter and exit the rink.',
            link: '/contact',
          },
          {
            icon: 'PackageCheck',
            title: 'Rental add-ons',
            description:
              'Ask about skate support, attendants, lighting, decor, barriers, music, seating, and branding options.',
            link: '/contact',
          },
          {
            icon: 'Wrench',
            title: 'Setup support',
            description:
              'Plan access windows, loading areas, setup timing, teardown timing, power needs, and weather or venue restrictions.',
            link: '/contact',
          },
        ],
      }),
      howItWorksBlock({
        title: 'How portable rink rentals are planned',
        steps: [
          [
            'Share event details',
            'Send the event date, location, venue type, guest count, surface details, and goals for the rental.',
          ],
          [
            'Review venue fit',
            'Confirm space, access, indoor or outdoor placement, power, timing, staffing, and local requirements.',
          ],
          [
            'Plan quote options',
            'Compare rink size, schedule, support level, add-ons, and any seasonal timing considerations.',
          ],
          [
            'Coordinate setup',
            'Use the confirmed scope to plan arrival windows, installation logistics, guest flow, and teardown.',
          ],
        ],
      }),
      faqBlock({
        title: 'Portable rink rental questions',
        subtitle: 'A few details help shape the right rental recommendation.',
        items: [
          [
            'How much space do portable ice rink rentals need?',
            'Space depends on the rink size, surrounding guest flow, skate changing area, barriers, access paths, and any add-ons. Share dimensions or venue plans when requesting a quote.',
          ],
          [
            'Can a portable rink be used indoors or outdoors?',
            'Portable rink rentals may be planned for indoor or outdoor venues, but the right setup depends on surface type, access, weather exposure, power, and venue rules.',
          ],
          [
            'How far ahead should we start planning?',
            'Start as early as possible for holiday dates and winter weekends. Lead time helps confirm availability, setup windows, add-ons, and venue requirements.',
          ],
          [
            'What add-ons should we ask about?',
            'Common add-ons include skate support, attendants, lighting, decor, music, barriers, branding, seating, and warming or hospitality areas.',
          ],
          [
            'What is needed for a quote request?',
            'Helpful details include event date, location, indoor or outdoor placement, available space, surface type, guest count, rental duration, and desired add-ons.',
          ],
        ],
      }),
      primaryCtaBlock({
        title: 'Ready to plan {{service}}?',
        description:
          'Send your event date, location, and venue details so the next step can be shaped around your rental goals.',
        buttonText: 'Get a Quote',
        buttonLink: '/contact',
        secondaryText: 'Planning a seasonal event?',
        secondaryLinkText: 'View event options',
        secondaryLink: '/events-holiday-activations',
      }),
    ],
  }),

  'events-holiday-activations': createPageTemplate({
    slug: 'events-holiday-activations',
    title: 'Ice Rink Rentals for Events and Holiday Activations',
    metaTitle: 'Ice Rink Rentals for Events and Holiday Activations | {{brand}}',
    metaDescription:
      'Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.',
    keyword: 'ice rink rentals for events',
    summary:
      '{{brand}} supports event and holiday activation planning with portable rink rental guidance for venues, towns, schools, malls, and private celebrations.',
    blocks: [
      heroBlock({
        eyebrow: 'Events and holiday activations',
        headline: 'Ice Rink Rentals for Events and Holiday Activations',
        subheadline:
          'Create a seasonal attraction for holiday activations, corporate winter events, town centers, schools, malls, private parties, and branded experiences with portable rink planning support.',
        buttonText: 'Get Event Quote',
        buttonLink: '/contact',
        secondaryButtonText: 'View Rental Options',
        secondaryButtonLink: '/ice-rink-rentals',
        trustLine: 'Event-focused planning for timing, layout, guest flow, staffing, add-ons, and logistics.',
      }),
      cardGridBlock({
        title: 'Event formats that fit portable rink rentals',
        subtitle:
          'Portable rink rentals can turn seasonal programs and one-time events into memorable guest experiences.',
        cards: [
          {
            icon: 'Briefcase',
            title: 'Corporate events',
            description:
              'Add a winter centerpiece to employee celebrations, client events, campus activations, and branded experiences.',
            link: '/contact',
          },
          {
            icon: 'MapPinned',
            title: 'Town festivals',
            description:
              'Support downtown holiday programming, tree lightings, winter markets, and community celebrations.',
            link: '/contact',
          },
          {
            icon: 'School',
            title: 'Schools',
            description:
              'Plan a student-friendly rink experience for winter carnivals, fundraisers, family nights, and campus events.',
            link: '/contact',
          },
          {
            icon: 'ShoppingBag',
            title: 'Malls and retail',
            description:
              'Create seasonal draw for shopping centers, mixed-use districts, hotels, and retail promotions.',
            link: '/contact',
          },
          {
            icon: 'Gift',
            title: 'Holiday parties',
            description:
              'Give guests a memorable winter activity for private, nonprofit, hospitality, and workplace events.',
            link: '/contact',
          },
          {
            icon: 'PartyPopper',
            title: 'Private celebrations',
            description:
              'Shape a standout skating experience for birthdays, weddings, neighborhood gatherings, and milestone events.',
            link: '/contact',
          },
        ],
      }),
      howItWorksBlock({
        title: 'Event planning considerations',
        steps: [
          [
            'Timing',
            'Confirm event date, seasonality, setup window, operating hours, teardown timing, and peak booking pressure.',
          ],
          [
            'Venue layout',
            'Map the rink footprint, skate area, check-in flow, guest circulation, emergency access, and nearby amenities.',
          ],
          [
            'Staffing and add-ons',
            'Discuss attendants, skate support, lighting, barriers, decor, branding, music, and seating needs.',
          ],
          [
            'Weather and logistics',
            'Review indoor or outdoor conditions, surface type, power, access, permits, insurance, and contingency planning.',
          ],
        ],
      }),
      faqBlock({
        title: 'Event and holiday activation questions',
        subtitle: 'Early planning helps match the rink experience to the event format.',
        items: [
          [
            'Can portable rink rentals work for one-day events?',
            'The right fit depends on setup timing, venue access, rental scope, staffing, and teardown windows. Share the schedule when requesting options.',
          ],
          [
            'What event details should we provide first?',
            'Start with the date, venue address, indoor or outdoor placement, guest count, available space, event hours, and any activation goals.',
          ],
          [
            'Can the rink be branded for sponsors or companies?',
            'Branding may be possible depending on the rental package and add-ons. Ask about signage, decor, lighting, and sponsor visibility during quote planning.',
          ],
          [
            'How should guest flow be planned?',
            'Plan space for entry, exit, skate support, viewing, seating, lines, staff access, and safe circulation around the rink.',
          ],
          [
            'What affects holiday availability?',
            'Peak dates, local travel, setup duration, rental length, add-ons, and venue requirements can all affect availability and timing.',
          ],
        ],
      }),
      primaryCtaBlock({
        title: 'Planning a winter event or holiday activation?',
        description:
          'Share your event format, date, location, and guest goals so the rental conversation starts with the right details.',
        buttonText: 'Get Event Quote',
        buttonLink: '/contact',
        secondaryText: 'Need rental basics first?',
        secondaryLinkText: 'View rental options',
        secondaryLink: '/ice-rink-rentals',
      }),
    ],
  }),

  contact: createPageTemplate({
    slug: 'contact',
    title: 'Request an Ice Rink Rental Quote',
    metaTitle: 'Request an Ice Rink Rental Quote | {{brand}}',
    metaDescription:
      'Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.',
    keyword: 'ice rink rental quote',
    summary:
      'Request a {{service}} quote by sharing event date, location, venue type, guest count, surface details, rental goals, and add-ons.',
    blocks: [
      heroBlock({
        eyebrow: 'Quote request',
        headline: 'Request an Ice Rink Rental Quote',
        subheadline:
          'Share your event date, location, venue type, guest count, surface details, rental goals, and add-on needs so the rental planning conversation starts clearly.',
        buttonText: 'Start Quote Request',
        buttonLink: '#contact',
        secondaryButtonText: '',
        secondaryButtonLink: '',
        trustLine: 'A few venue and timing details help shape a faster, more useful rental quote.',
      }),
      contactBlock(),
      cardGridBlock({
        title: 'Helpful details for a quote',
        subtitle:
          'The more context you can share, the easier it is to understand availability, setup needs, and rental fit.',
        cards: [
          {
            icon: 'CalendarCheck',
            title: 'Event date',
            description:
              'Include your preferred date, backup dates, setup window, operating hours, and teardown expectations.',
          },
          {
            icon: 'MapPin',
            title: 'Location',
            description:
              'Share the venue address, city, access notes, loading area, and whether the event is public or private.',
          },
          {
            icon: 'Tent',
            title: 'Indoor or outdoor',
            description:
              'Tell us whether the rink would be inside, outside, covered, or exposed to weather.',
          },
          {
            icon: 'Warehouse',
            title: 'Surface type',
            description:
              'Describe the surface, available footprint, slope concerns, power access, and nearby constraints.',
          },
          {
            icon: 'Users',
            title: 'Expected attendance',
            description:
              'Estimate guest count, participant volume, event flow, age range, and whether skating is the main attraction.',
          },
          {
            icon: 'Sparkles',
            title: 'Add-ons',
            description:
              'Mention skate support, attendants, lighting, music, decor, branding, seating, or hospitality needs.',
          },
        ],
      }),
      faqBlock({
        title: 'Quote request questions',
        subtitle: 'These answers help set expectations before the rental team follows up.',
        items: [
          [
            'What should I include in a quote request?',
            'Include date, location, indoor or outdoor placement, available space, surface type, guest count, rental duration, and add-ons.',
          ],
          [
            'Can I request pricing before all details are final?',
            'Yes. Early details can start the conversation, and the rental scope can be refined as the venue, timing, and event goals become clearer.',
          ],
          [
            'Do you need venue photos or layout details?',
            'Photos, site maps, measurements, and access notes are helpful because they clarify footprint, surface, loading, and guest-flow needs.',
          ],
          [
            'What happens after I submit the form?',
            'The next step is to review availability, venue fit, setup considerations, add-ons, and any details needed to shape quote options.',
          ],
        ],
      }),
      primaryCtaBlock({
        title: 'Have the basics ready?',
        description:
          'Send the event date, location, and venue details so the rental quote process can start with useful context.',
        buttonText: 'Start Quote Request',
        buttonLink: '#contact',
        secondaryText: 'Still comparing options?',
        secondaryLinkText: 'Review rental planning',
        secondaryLink: '/ice-rink-rentals',
      }),
    ],
  }),
};

export function getFallbackPage(site: ResolvedSite, slug: string): Page | null {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug || normalizedSlug === 'home') {
    return getFallbackHome(site);
  }

  const template = fallbackPageTemplates[normalizedSlug];
  if (!template) return null;

  return {
    ...replaceSiteTokens(template, site),
    id: `${site.key}-fallback-${normalizedSlug}`,
    PageId: `${site.key}-fallback-${normalizedSlug}`,
    tenantId: site.tenantId || site.key,
  };
}

export function getFallbackSitemapEntries(): Array<{ pageSlug: string; lastModified: string }> {
  return ['home', ...Object.keys(fallbackPageTemplates)].map((pageSlug) => ({
    pageSlug,
    lastModified: PAGE_DATE,
  }));
}

function createPageTemplate({
  slug,
  title,
  metaTitle,
  metaDescription,
  keyword,
  summary,
  blocks,
}: {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keyword: string;
  summary: string;
  blocks: IHtmlBlock[];
}): Page {
  return {
    id: `fallback-${slug}`,
    PageId: `fallback-${slug}`,
    tenantId: '',
    pageSlug: slug,
    PageVersion: 1,
    Layout: 'default',
    MetaData: {
      category: 'rentals',
      product: '{{product}}',
      keyword,
      pageType: 'landing',
      title,
      description: metaDescription,
      createdAt: PAGE_DATE,
      updatedAt: PAGE_DATE,
      author: '{{brand}} Team',
      language: 'en',
      market: 'us',
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword,
      tags: ['{{service}}', '{{product}} rental', keyword, 'event rentals'],
      contentSummary: summary,
      blockTypes: blocks.map((block) => block.type),
    },
    seo: {
      metaTitle,
      metaDescription,
      keywords: ['{{service}}', '{{product}} rental', keyword, 'portable rink rentals'],
      robots: 'index, follow',
      canonicalUrl: `{{canonicalUrl}}/${slug}`,
      alternateUrls: [],
      structuredData: [
        `{"@context":"https://schema.org","@type":"WebPage","name":"${title}","url":"{{canonicalUrl}}/${slug}","description":"${metaDescription}"}`,
      ],
      openGraph: {
        'og:title': metaTitle,
        'og:description': metaDescription,
        'og:type': 'website',
        'og:url': `{{canonicalUrl}}/${slug}`,
        'og:image': '',
        'og:image:alt': '{{brand}}',
        'og:site_name': '{{brand}}',
        'og:locale': 'en_US',
      },
      twitterCard: {
        'twitter:card': 'summary_large_image',
        'twitter:title': metaTitle,
        'twitter:description': metaDescription,
        'twitter:image': '',
        'twitter:site': '',
        'twitter:creator': '',
      },
    },
    isPublished: true,
    publishedAt: PAGE_DATE,
    includeInSitemap: true,
    contentRelationships: {
      isHub: slug === 'ice-rink-rentals',
      hubPageSlug: slug === 'ice-rink-rentals' ? '' : 'ice-rink-rentals',
      topicCluster: 'ice-rink-rentals',
      relatedHubs: [],
      spokePriority: slug === 'ice-rink-rentals' ? 0 : 1,
    },
    ContentData: {
      ContentBlocks: blocks,
    },
  };
}

function heroBlock(content: {
  eyebrow: string;
  headline: string;
  subheadline: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  trustLine: string;
}): IHtmlBlock {
  return {
    type: 'Hero',
    content: {
      type: 'Main',
      backgroundImage: '',
      backgroundImageAltText: '',
      mainImage: '',
      mainImageAltText: content.headline,
      ...content,
    },
  };
}

function trustBarBlock(items: Array<[string, string, string]>): IHtmlBlock {
  return {
    type: 'TrustBar',
    content: {
      items: items.map(([icon, title, text]) => ({
        icon,
        title,
        text,
        alt: title,
      })),
    },
  };
}

function cardGridBlock({
  title,
  subtitle,
  cards,
}: {
  title: string;
  subtitle: string;
  cards: Array<{
    icon: string;
    title: string;
    description: string;
    link?: string;
  }>;
}): IHtmlBlock {
  return {
    type: 'CardGrid',
    content: {
      title,
      subtitle,
      layout: cards.length > 4 ? 'grid-3' : 'grid-2',
      cards: cards.map((card) => ({
        title: card.title,
        description: card.description,
        image: '',
        'image-alt': '',
        icon: card.icon,
        link: card.link || '',
        alt: card.title,
      })),
    },
  };
}

function howItWorksBlock({
  title,
  steps,
}: {
  title: string;
  steps: Array<[string, string]>;
}): IHtmlBlock {
  return {
    type: 'HowItWorks',
    content: {
      title,
      steps: steps.map(([stepTitle, text]) => ({
        title: stepTitle,
        text,
        image: '',
        alt: stepTitle,
      })),
    },
  };
}

function faqBlock({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<[string, string]>;
}): IHtmlBlock {
  return {
    type: 'FAQ',
    content: {
      title,
      subtitle,
      layout: 'accordion',
      items: items.map(([question, answer]) => ({ question, answer })),
    },
  };
}

function primaryCtaBlock(content: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryText: string;
  secondaryLinkText: string;
  secondaryLink: string;
}): IHtmlBlock {
  return {
    type: 'PrimaryCTA',
    content: {
      ...content,
      backgroundImage: '',
      mainImage: '',
      alt: content.title,
    },
  };
}

function contactBlock(): IHtmlBlock {
  return {
    type: 'Contact',
    content: {
      id: 'contact',
      title: 'Start your quote request',
      subtitle:
        'Share the basics below and the rental conversation can start with the details that matter most.',
      address: '',
      phone: '',
      email: 'hello@{{domain}}',
      hours: 'Responses are prioritized by event date, season, and venue readiness.',
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

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, '').toLowerCase();
}
