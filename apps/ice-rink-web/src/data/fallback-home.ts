import type { Page } from 'pumpkin-ts-models';
import type { ResolvedSite } from '@/config/sites';
import { replaceSiteTokens } from '@/lib/token-replace';

const fallbackHomeTemplate: Page = {
  id: 'fallback-home',
  PageId: 'fallback-home',
  tenantId: '',
  pageSlug: 'home',
  PageVersion: 1,
  Layout: 'default',
  MetaData: {
    category: 'rentals',
    product: '{{product}}',
    keyword: '{{service}}',
    pageType: 'landing',
    title: '{{brand}}',
    description: '{{service}} for private events, corporate activations, holiday markets, venues, schools, and municipalities.',
    createdAt: '2026-05-12T00:00:00Z',
    updatedAt: '2026-05-12T00:00:00Z',
    author: '{{brand}} Team',
    language: 'en',
    market: 'us',
  },
  searchData: {
    state: '',
    city: '',
    metro: '',
    county: '',
    keyword: '{{service}}',
    tags: ['{{service}}', '{{product}} rental', '{{products}}', 'event rentals'],
    contentSummary: '{{brand}} helps event planners and venues book {{service}} with clear requirements, package guidance, and fast quote intake.',
    blockTypes: ['Hero', 'TrustBar', 'CardGrid', 'HowItWorks', 'ServiceAreaMap', 'Testimonials', 'FAQ', 'Contact', 'PrimaryCTA'],
  },
  seo: {
    metaTitle: '{{brand}} | {{service}}',
    metaDescription: 'Book {{service}} for events, holiday activations, private parties, schools, and venues. Get package guidance and a fast quote.',
    keywords: ['{{service}}', '{{product}} rental', '{{products}} for events', 'temporary rental'],
    robots: 'index, follow',
    canonicalUrl: '{{canonicalUrl}}',
    alternateUrls: [],
    structuredData: [
      '{"@context":"https://schema.org","@type":"LocalBusiness","name":"{{brand}}","url":"{{canonicalUrl}}","description":"{{service}} for events and venues."}',
    ],
    openGraph: {
      'og:title': '{{brand}} | {{service}}',
      'og:description': 'Plan a polished rental experience with package guidance, venue requirements, and fast quote intake.',
      'og:type': 'website',
      'og:url': '{{canonicalUrl}}',
      'og:image': '',
      'og:image:alt': '{{brand}}',
      'og:site_name': '{{brand}}',
      'og:locale': 'en_US',
    },
    twitterCard: {
      'twitter:card': 'summary_large_image',
      'twitter:title': '{{brand}} | {{service}}',
      'twitter:description': 'Plan {{service}} for events, venues, and seasonal activations.',
      'twitter:image': '',
      'twitter:site': '',
      'twitter:creator': '',
    },
  },
  isPublished: true,
  publishedAt: '2026-05-12T00:00:00Z',
  includeInSitemap: true,
  contentRelationships: {
    isHub: true,
    hubPageSlug: '',
    topicCluster: 'rental-services',
    relatedHubs: [],
    spokePriority: 0,
  },
  ContentData: {
    ContentBlocks: [
      {
        type: 'Hero',
        content: {
          type: 'Main',
          headline: '{{service}} for events that need a real centerpiece',
          subheadline: 'Build a memorable guest experience with planning support, clear venue requirements, and rental packages sized around your event.',
          backgroundImage: '',
          backgroundImageAltText: '',
          mainImage: '',
          mainImageAltText: '{{service}} event setup',
          buttonText: 'Get a Quote',
          buttonLink: '/contact',
        },
      },
      {
        type: 'TrustBar',
        content: {
          items: [
            { icon: 'CalendarCheck', title: 'Event Ready', text: 'Private, public, and seasonal rentals', alt: 'Event ready' },
            { icon: 'MapPin', title: 'Venue Planning', text: 'Space, access, and setup guidance', alt: 'Venue planning' },
            { icon: 'ShieldCheck', title: 'Requirements First', text: 'Clear safety and logistics review', alt: 'Requirements first' },
            { icon: 'Clock', title: 'Fast Quotes', text: 'Tell us the date, place, and scope', alt: 'Fast quotes' },
          ],
        },
      },
      {
        type: 'CardGrid',
        content: {
          title: 'Rental solutions for every event format',
          subtitle: 'Use Pumpkin CMS content blocks to shape each site around its rental category while keeping one reusable frontend.',
          layout: 'grid-3',
          cards: [
            {
              title: 'Holiday activations',
              description: 'Create a seasonal attraction for towns, malls, shopping districts, hotels, and brand activations.',
              image: '',
              'image-alt': '',
              icon: 'Sparkles',
              link: '/events-holiday-activations',
              alt: 'Holiday activations',
            },
            {
              title: 'Private celebrations',
              description: 'Give weddings, milestone birthdays, school events, and community gatherings a standout experience.',
              image: '',
              'image-alt': '',
              icon: 'PartyPopper',
              link: '/ice-rink-rentals',
              alt: 'Private celebrations',
            },
            {
              title: 'Commercial venues',
              description: 'Add a bookable attraction for venues with enough space, access, and operational support.',
              image: '',
              'image-alt': '',
              icon: 'Building2',
              link: '/contact',
              alt: 'Commercial venues',
            },
          ],
        },
      },
      {
        type: 'HowItWorks',
        content: {
          title: 'How rentals are planned',
          steps: [
            { title: 'Share your event', text: 'Send the date, location, expected attendance, surface type, and event goals.', image: '', alt: 'Share your event' },
            { title: 'Review requirements', text: 'Confirm space, access, power, timing, staffing, permits, and weather considerations.', image: '', alt: 'Review requirements' },
            { title: 'Finalize a package', text: 'Choose the rental size, add-ons, schedule, and support level that fit the event.', image: '', alt: 'Finalize a package' },
          ],
        },
      },
      {
        type: 'ServiceAreaMap',
        content: {
          title: 'Tell us where the event is happening',
          subtitle: 'Coverage and logistics depend on the site, season, setup duration, and travel distance.',
          mapEmbedUrl: '',
          neighborhoods: ['Corporate campuses', 'Town centers', 'Shopping districts', 'Hotels and resorts'],
          zipCodes: ['Seasonal events', 'Private parties', 'Municipal programs', 'Brand activations'],
          nearbyCities: ['Indoor venues', 'Outdoor venues', 'Temporary activations', 'Multi-day rentals'],
        },
      },
      {
        type: 'Testimonials',
        content: {
          title: 'Built for serious rental inquiries',
          subtitle: 'This fallback page is ready for real CMS content as soon as the tenant is seeded.',
          layout: 'grid',
          items: [
            { quote: 'The planning flow made it easy to understand what information the rental team needed.', author: 'Event Planner', eventType: 'Corporate Event', rating: 5 },
            { quote: 'The site explained requirements clearly before we requested pricing.', author: 'Venue Manager', eventType: 'Seasonal Activation', rating: 5 },
            { quote: 'The reusable frontend lets each rental category keep its own brand and content.', author: 'Site Owner', eventType: 'Multi-site rollout', rating: 5 },
          ],
        },
      },
      {
        type: 'FAQ',
        content: {
          title: 'Common rental questions',
          subtitle: 'Use CMS content to tune these answers for each rental category.',
          layout: 'accordion',
          items: [
            { question: 'How far ahead should we request a quote?', answer: 'Earlier is better, especially for holiday and winter-season events. Share your event date, location, and site details first.' },
            { question: 'What information is needed for pricing?', answer: 'The team needs event dates, venue address, setup surface, available space, rental duration, guest count, and any add-ons.' },
            { question: 'Can this frontend support multiple rental websites?', answer: 'Yes. The current app resolves the domain to a site config, tenant ID, API key, canonical URL, and brand tokens server-side.' },
          ],
        },
      },
      {
        type: 'PrimaryCTA',
        content: {
          title: 'Ready to plan {{service}}?',
          description: 'Send the basics and we will help identify the right next step for your event.',
          buttonText: 'Request a Quote',
          buttonLink: '/contact',
          secondaryText: 'Need package details first?',
          secondaryLinkText: 'View rental options',
          secondaryLink: '/ice-rink-rentals',
          backgroundImage: '',
          mainImage: '',
          alt: '{{service}} quote request',
        },
      },
      {
        type: 'Contact',
        content: {
          id: 'quote-form',
          title: 'Request a rental quote',
          subtitle: 'Share your event details and the team can follow up with availability, requirements, and package options.',
          address: '',
          phone: '',
          email: 'hello@{{domain}}',
          hours: 'Responses are prioritized by event date and season.',
          formFields: [
            { label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
            { label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
            { label: 'Event Date', type: 'text', required: true, placeholder: 'Preferred date or date range' },
            { label: 'Event Location', type: 'text', required: true, placeholder: 'City, state, and venue' },
            { label: 'Event Details', type: 'textarea', required: true, placeholder: 'Tell us about guests, space, rental duration, and goals' },
          ],
          submitButtonText: 'Send Request',
          socialLinks: [],
        },
      },
    ],
  },
};

export function getFallbackHome(site: ResolvedSite): Page {
  return {
    ...replaceSiteTokens(fallbackHomeTemplate, site),
    id: `${site.key}-fallback-home`,
    PageId: `${site.key}-fallback-home`,
    tenantId: site.tenantId || site.key,
  };
}
