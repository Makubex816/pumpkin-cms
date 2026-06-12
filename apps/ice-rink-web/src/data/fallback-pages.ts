import type { IHtmlBlock, Page } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { replaceSiteTokens } from '@/lib/token-replace';
import { getFallbackHome } from './fallback-home';

const PAGE_DATE = '2026-05-12T00:00:00Z';

const fallbackPageTemplates: Record<string, Page> = {
  'service-areas': createPageTemplate({
    slug: 'service-areas',
    title: 'Portable Ice Rink Rental Service Areas',
    metaTitle: 'Portable Ice Rink Rental Service Areas | {{brand}}',
    metaDescription:
      'Review portable ice rink rental service-area planning and request availability review for your event city, date, venue, and support needs.',
    keyword: 'Portable Ice Rink Rental Service Areas',
    summary:
      '{{brand}} reviews event location, venue details, timing, and setup requirements before confirming portable rink rental availability.',
    blocks: [
      heroBlock({
        eyebrow: 'Service-area review',
        headline: 'Portable Ice Rink Rental Service Areas',
        subheadline:
          'Share your event city, venue details, timing, setup surface, and support needs so portable rink rental availability can be reviewed.',
        buttonText: 'Request Availability',
        buttonLink: '/contact',
        secondaryButtonText: 'Return Home',
        secondaryButtonLink: '/',
        trustLine: 'Availability is reviewed from event location, venue fit, setup timing, and route feasibility.',
      }),
      trustBarBlock([
        ['MapPin', 'Route Review', 'Event city, venue access, and timing are reviewed first'],
        ['CalendarCheck', 'Date Fit', 'Peak winter dates need early setup-window review'],
        ['Ruler', 'Venue Details', 'Surface, space, loading, and guest flow shape feasibility'],
        ['ClipboardCheck', 'Quote Path', 'Share the basics so the team can identify next steps'],
      ]),
      cardGridBlock({
        title: 'What service-area review considers',
        subtitle:
          'Availability is reviewed from the event location and practical setup requirements, not just the city name.',
        cards: [
          {
            icon: 'MapPinned',
            title: 'Event location',
            description:
              'Share the city, state, venue name, access notes, and whether the site is public, private, indoor, or outdoor.',
            link: '/contact',
          },
          {
            icon: 'Warehouse',
            title: 'Setup surface',
            description:
              'Surface type, slope, size, nearby access, and power availability all affect whether a portable rink can fit.',
            link: '/contact',
          },
          {
            icon: 'Clock',
            title: 'Seasonal timing',
            description:
              'Holiday activations, town events, school programs, and winter weekends should be reviewed as early as possible.',
            link: '/contact',
          },
        ],
      }),
      howItWorksBlock({
        title: 'How coverage is reviewed',
        steps: [
          [
            'Send location details',
            'Include the city, state, venue address, indoor or outdoor placement, and event date range.',
          ],
          [
            'Review site fit',
            'The team reviews available space, surface conditions, access, setup windows, power, and guest flow.',
          ],
          [
            'Confirm next steps',
            'If the route and venue details are workable, the quote conversation can move into size, schedule, and support options.',
          ],
        ],
      }),
      faqBlock({
        title: 'Service-area questions',
        subtitle: 'These answers help frame availability before a formal quote.',
        items: [
          [
            'Do you list every city you can serve?',
            'No. Local proof content uses a request-review model. Share your city, venue, event date, and setup details so availability can be reviewed.',
          ],
          [
            'What details make service-area review faster?',
            'Helpful details include venue address, indoor or outdoor placement, available footprint, surface type, access path, rental dates, and expected attendance.',
          ],
          [
            'Can new city pages be created from this route?',
            'Future city or state pages require separate content, approval, and publish gates. This local source only repairs the canonical service-areas route.',
          ],
          [
            'Does this page confirm service everywhere?',
            'No. It explains the review process and avoids unsupported geographic claims until a request is reviewed.',
          ],
        ],
      }),
      primaryCtaBlock({
        title: 'Need service-area review for your event?',
        description:
          'Send your location, date, venue type, and setup details so the rental conversation can begin with the right context.',
        buttonText: 'Request Availability',
        buttonLink: '/contact',
        secondaryText: 'Need the basics first?',
        secondaryLinkText: 'Return home',
        secondaryLink: '/',
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
        secondaryLinkText: 'Review service-area planning',
        secondaryLink: '/service-areas',
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
      isHub: false,
      hubPageSlug: 'home',
      topicCluster: 'ice-rink-rentals',
      relatedHubs: [],
      spokePriority: slug === 'service-areas' ? 1 : 2,
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
