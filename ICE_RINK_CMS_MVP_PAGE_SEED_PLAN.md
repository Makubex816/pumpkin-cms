# Ice Rink CMS MVP Page Seed Plan

## Summary

The CMS-backed `home` page is confirmed working through Cosmos DB, Pumpkin API, and `apps/ice-rink-web`. The next safe step is to manually insert the remaining MVP page documents into the `Page` container for tenant `ice-rink-rentals`.

This report provides seed-ready JSON for:

- `ice-rink-rentals`
- `events-holiday-activations`
- `contact`

These documents use only existing supported CMS block types. They intentionally include `CMS LIVE:` in each hero headline so the frontend can be verified against real CMS data. Remove that marker after connection testing.

## Insert Location

Use Cosmos Emulator Data Explorer:

```text
https://localhost:8081/_explorer/index.html
```

Insert each document here:

```text
PumpkinCMS
  Page
    Items
```

Partition key value for every item:

```text
ice-rink-rentals
```

## Page 1: ice-rink-rentals

Cosmos path:

```text
PumpkinCMS / Page / Items / id: ice-rink-rentals-ice-rink-rentals
partition key: ice-rink-rentals
```

```json
{
  "id": "ice-rink-rentals-ice-rink-rentals",
  "PageId": "ice-rink-rentals-ice-rink-rentals",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "ice-rink-rentals",
  "PageVersion": 1,
  "Layout": "default",
  "MetaData": {
    "category": "rentals",
    "product": "portable ice rink",
    "keyword": "Portable Ice Rink Rentals",
    "pageType": "landing",
    "title": "CMS LIVE: Portable Ice Rink Rentals",
    "description": "Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.",
    "createdAt": "2026-05-13T00:00:00Z",
    "updatedAt": "2026-05-13T00:00:00Z",
    "author": "Ice Skating Rink Rentals Team",
    "language": "en-us",
    "market": "us"
  },
  "searchData": {
    "state": "",
    "city": "",
    "metro": "",
    "county": "",
    "keyword": "Portable Ice Rink Rentals",
    "tags": ["Portable Ice Rink Rentals", "portable ice rink rental", "winter event rentals", "ice rink rentals"],
    "contentSummary": "Ice Skating Rink Rentals helps planners compare portable ice rink rental options, venue requirements, add-ons, setup support, and quote steps.",
    "blockTypes": ["Hero", "TrustBar", "CardGrid", "HowItWorks", "FAQ", "PrimaryCTA"]
  },
  "ContentData": {
    "ContentBlocks": [
      {
        "type": "Hero",
        "content": {
          "type": "Main",
          "headline": "CMS LIVE: Portable Ice Rink Rentals",
          "subheadline": "Bring a polished winter attraction to school events, corporate parties, town festivals, private celebrations, and seasonal programs with portable rink planning, setup guidance, and quote support.",
          "backgroundImage": "",
          "backgroundImageAltText": "",
          "mainImage": "",
          "mainImageAltText": "Portable Ice Rink Rentals",
          "buttonText": "Get a Quote",
          "buttonLink": "/contact"
        }
      },
      {
        "type": "TrustBar",
        "content": {
          "items": [
            { "icon": "MapPin", "title": "Venue Planning", "text": "Space, surface, access, and layout review", "alt": "Venue Planning" },
            { "icon": "Wrench", "title": "Setup Guidance", "text": "Practical setup details before quote planning", "alt": "Setup Guidance" },
            { "icon": "Ruler", "title": "Event-ready Layout", "text": "Rink sizing and guest-flow considerations", "alt": "Event-ready Layout" },
            { "icon": "ClipboardCheck", "title": "Quote Support", "text": "A clearer path from idea to rental request", "alt": "Quote Support" }
          ]
        }
      },
      {
        "type": "CardGrid",
        "content": {
          "title": "Portable rink rental planning in one place",
          "subtitle": "Use these sections to understand what affects rink size, setup, staffing, add-ons, and timing before requesting a quote.",
          "layout": "grid-2",
          "cards": [
            {
              "title": "Event types",
              "description": "Portable rink rentals can support winter festivals, school celebrations, corporate events, holiday parties, and private gatherings.",
              "image": "",
              "image-alt": "",
              "icon": "Snowflake",
              "link": "/events-holiday-activations",
              "alt": "Event types"
            },
            {
              "title": "Rink planning",
              "description": "Confirm available space, surface type, indoor or outdoor placement, guest count, and how visitors will enter and exit the rink.",
              "image": "",
              "image-alt": "",
              "icon": "Ruler",
              "link": "/contact",
              "alt": "Rink planning"
            },
            {
              "title": "Rental add-ons",
              "description": "Ask about skate support, attendants, lighting, decor, barriers, music, seating, and branding options.",
              "image": "",
              "image-alt": "",
              "icon": "PackageCheck",
              "link": "/contact",
              "alt": "Rental add-ons"
            },
            {
              "title": "Setup support",
              "description": "Plan access windows, loading areas, setup timing, teardown timing, power needs, and weather or venue restrictions.",
              "image": "",
              "image-alt": "",
              "icon": "Wrench",
              "link": "/contact",
              "alt": "Setup support"
            }
          ]
        }
      },
      {
        "type": "HowItWorks",
        "content": {
          "title": "How portable rink rentals are planned",
          "steps": [
            { "title": "Share event details", "text": "Send the event date, location, venue type, guest count, surface details, and goals for the rental.", "image": "", "alt": "Share event details" },
            { "title": "Review venue fit", "text": "Confirm space, access, indoor or outdoor placement, power, timing, staffing, and local requirements.", "image": "", "alt": "Review venue fit" },
            { "title": "Plan quote options", "text": "Compare rink size, schedule, support level, add-ons, and any seasonal timing considerations.", "image": "", "alt": "Plan quote options" },
            { "title": "Coordinate setup", "text": "Use the confirmed scope to plan arrival windows, installation logistics, guest flow, and teardown.", "image": "", "alt": "Coordinate setup" }
          ]
        }
      },
      {
        "type": "FAQ",
        "content": {
          "title": "Portable rink rental questions",
          "subtitle": "A few details help shape the right rental recommendation.",
          "layout": "accordion",
          "items": [
            { "question": "How much space do portable ice rink rentals need?", "answer": "Space depends on the rink size, surrounding guest flow, skate changing area, barriers, access paths, and any add-ons. Share dimensions or venue plans when requesting a quote." },
            { "question": "Can a portable rink be used indoors or outdoors?", "answer": "Portable rink rentals may be planned for indoor or outdoor venues, but the right setup depends on surface type, access, weather exposure, power, and venue rules." },
            { "question": "How far ahead should we start planning?", "answer": "Start as early as possible for holiday dates and winter weekends. Lead time helps confirm availability, setup windows, add-ons, and venue requirements." },
            { "question": "What add-ons should we ask about?", "answer": "Common add-ons include skate support, attendants, lighting, decor, music, barriers, branding, seating, and warming or hospitality areas." },
            { "question": "What is needed for a quote request?", "answer": "Helpful details include event date, location, indoor or outdoor placement, available space, surface type, guest count, rental duration, and desired add-ons." }
          ]
        }
      },
      {
        "type": "PrimaryCTA",
        "content": {
          "title": "Ready to plan Portable Ice Rink Rentals?",
          "description": "Send your event date, location, and venue details so the next step can be shaped around your rental goals.",
          "buttonText": "Get a Quote",
          "buttonLink": "/contact",
          "secondaryText": "Planning a seasonal event?",
          "secondaryLinkText": "View event options",
          "secondaryLink": "/events-holiday-activations",
          "backgroundImage": "",
          "mainImage": "",
          "alt": "Portable Ice Rink Rentals"
        }
      }
    ]
  },
  "contentRelationships": {
    "isHub": true,
    "hubPageSlug": "",
    "topicCluster": "ice-rink-rentals",
    "relatedHubs": [],
    "spokePriority": 0
  },
  "seo": {
    "metaTitle": "CMS LIVE: Portable Ice Rink Rentals | Ice Skating Rink Rentals",
    "metaDescription": "Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.",
    "keywords": ["Portable Ice Rink Rentals", "portable ice rink rental", "winter event rentals", "ice rink rentals"],
    "robots": "index, follow",
    "canonicalUrl": "https://iceskatingrinkrentals.com/ice-rink-rentals",
    "alternateUrls": [],
    "structuredData": [
      "{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Portable Ice Rink Rentals\",\"url\":\"https://iceskatingrinkrentals.com/ice-rink-rentals\",\"description\":\"Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.\"}"
    ],
    "openGraph": {
      "og:title": "CMS LIVE: Portable Ice Rink Rentals | Ice Skating Rink Rentals",
      "og:description": "Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.",
      "og:type": "website",
      "og:url": "https://iceskatingrinkrentals.com/ice-rink-rentals",
      "og:image": "",
      "og:image:alt": "Ice Skating Rink Rentals",
      "og:site_name": "Ice Skating Rink Rentals",
      "og:locale": "en_US"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:title": "CMS LIVE: Portable Ice Rink Rentals | Ice Skating Rink Rentals",
      "twitter:description": "Plan portable ice rink rentals for winter events, school events, corporate parties, town festivals, and private celebrations.",
      "twitter:image": "",
      "twitter:site": "",
      "twitter:creator": ""
    }
  },
  "isPublished": true,
  "publishedAt": "2026-05-13T00:00:00Z",
  "includeInSitemap": true
}
```

## Page 2: events-holiday-activations

Cosmos path:

```text
PumpkinCMS / Page / Items / id: ice-rink-rentals-events-holiday-activations
partition key: ice-rink-rentals
```

```json
{
  "id": "ice-rink-rentals-events-holiday-activations",
  "PageId": "ice-rink-rentals-events-holiday-activations",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "events-holiday-activations",
  "PageVersion": 1,
  "Layout": "default",
  "MetaData": {
    "category": "rentals",
    "product": "portable ice rink",
    "keyword": "ice rink rentals for events",
    "pageType": "landing",
    "title": "CMS LIVE: Ice Rink Rentals for Events and Holiday Activations",
    "description": "Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.",
    "createdAt": "2026-05-13T00:00:00Z",
    "updatedAt": "2026-05-13T00:00:00Z",
    "author": "Ice Skating Rink Rentals Team",
    "language": "en-us",
    "market": "us"
  },
  "searchData": {
    "state": "",
    "city": "",
    "metro": "",
    "county": "",
    "keyword": "ice rink rentals for events",
    "tags": ["Portable Ice Rink Rentals", "portable ice rink rental", "ice rink rentals for events", "holiday activations"],
    "contentSummary": "Ice Skating Rink Rentals supports event and holiday activation planning with portable rink rental guidance for venues, towns, schools, malls, and private celebrations.",
    "blockTypes": ["Hero", "CardGrid", "HowItWorks", "FAQ", "PrimaryCTA"]
  },
  "ContentData": {
    "ContentBlocks": [
      {
        "type": "Hero",
        "content": {
          "type": "Main",
          "headline": "CMS LIVE: Ice Rink Rentals for Events and Holiday Activations",
          "subheadline": "Create a seasonal attraction for holiday activations, corporate winter events, town centers, schools, malls, private parties, and branded experiences with portable rink planning support.",
          "backgroundImage": "",
          "backgroundImageAltText": "",
          "mainImage": "",
          "mainImageAltText": "Ice rink rentals for events and holiday activations",
          "buttonText": "Get Event Quote",
          "buttonLink": "/contact"
        }
      },
      {
        "type": "CardGrid",
        "content": {
          "title": "Event formats that fit portable rink rentals",
          "subtitle": "Portable rink rentals can turn seasonal programs and one-time events into memorable guest experiences.",
          "layout": "grid-3",
          "cards": [
            {
              "title": "Corporate events",
              "description": "Add a winter centerpiece to employee celebrations, client events, campus activations, and branded experiences.",
              "image": "",
              "image-alt": "",
              "icon": "Briefcase",
              "link": "/contact",
              "alt": "Corporate events"
            },
            {
              "title": "Town festivals",
              "description": "Support downtown holiday programming, tree lightings, winter markets, and community celebrations.",
              "image": "",
              "image-alt": "",
              "icon": "MapPinned",
              "link": "/contact",
              "alt": "Town festivals"
            },
            {
              "title": "Schools",
              "description": "Plan a student-friendly rink experience for winter carnivals, fundraisers, family nights, and campus events.",
              "image": "",
              "image-alt": "",
              "icon": "School",
              "link": "/contact",
              "alt": "Schools"
            },
            {
              "title": "Malls and retail",
              "description": "Create seasonal draw for shopping centers, mixed-use districts, hotels, and retail promotions.",
              "image": "",
              "image-alt": "",
              "icon": "ShoppingBag",
              "link": "/contact",
              "alt": "Malls and retail"
            },
            {
              "title": "Holiday parties",
              "description": "Give guests a memorable winter activity for private, nonprofit, hospitality, and workplace events.",
              "image": "",
              "image-alt": "",
              "icon": "Gift",
              "link": "/contact",
              "alt": "Holiday parties"
            },
            {
              "title": "Private celebrations",
              "description": "Shape a standout skating experience for birthdays, weddings, neighborhood gatherings, and milestone events.",
              "image": "",
              "image-alt": "",
              "icon": "PartyPopper",
              "link": "/contact",
              "alt": "Private celebrations"
            }
          ]
        }
      },
      {
        "type": "HowItWorks",
        "content": {
          "title": "Event planning considerations",
          "steps": [
            { "title": "Timing", "text": "Confirm event date, seasonality, setup window, operating hours, teardown timing, and peak booking pressure.", "image": "", "alt": "Timing" },
            { "title": "Venue layout", "text": "Map the rink footprint, skate area, check-in flow, guest circulation, emergency access, and nearby amenities.", "image": "", "alt": "Venue layout" },
            { "title": "Staffing and add-ons", "text": "Discuss attendants, skate support, lighting, barriers, decor, branding, music, and seating needs.", "image": "", "alt": "Staffing and add-ons" },
            { "title": "Weather and logistics", "text": "Review indoor or outdoor conditions, surface type, power, access, permits, insurance, and contingency planning.", "image": "", "alt": "Weather and logistics" }
          ]
        }
      },
      {
        "type": "FAQ",
        "content": {
          "title": "Event and holiday activation questions",
          "subtitle": "Early planning helps match the rink experience to the event format.",
          "layout": "accordion",
          "items": [
            { "question": "Can portable rink rentals work for one-day events?", "answer": "The right fit depends on setup timing, venue access, rental scope, staffing, and teardown windows. Share the schedule when requesting options." },
            { "question": "What event details should we provide first?", "answer": "Start with the date, venue address, indoor or outdoor placement, guest count, available space, event hours, and any activation goals." },
            { "question": "Can the rink be branded for sponsors or companies?", "answer": "Branding may be possible depending on the rental package and add-ons. Ask about signage, decor, lighting, and sponsor visibility during quote planning." },
            { "question": "How should guest flow be planned?", "answer": "Plan space for entry, exit, skate support, viewing, seating, lines, staff access, and safe circulation around the rink." },
            { "question": "What affects holiday availability?", "answer": "Peak dates, local travel, setup duration, rental length, add-ons, and venue requirements can all affect availability and timing." }
          ]
        }
      },
      {
        "type": "PrimaryCTA",
        "content": {
          "title": "Planning a winter event or holiday activation?",
          "description": "Share your event format, date, location, and guest goals so the rental conversation starts with the right details.",
          "buttonText": "Get Event Quote",
          "buttonLink": "/contact",
          "secondaryText": "Need rental basics first?",
          "secondaryLinkText": "View rental options",
          "secondaryLink": "/ice-rink-rentals",
          "backgroundImage": "",
          "mainImage": "",
          "alt": "Ice rink rentals for events and holiday activations"
        }
      }
    ]
  },
  "contentRelationships": {
    "isHub": false,
    "hubPageSlug": "ice-rink-rentals",
    "topicCluster": "ice-rink-rentals",
    "relatedHubs": [],
    "spokePriority": 1
  },
  "seo": {
    "metaTitle": "CMS LIVE: Ice Rink Rentals for Events and Holiday Activations | Ice Skating Rink Rentals",
    "metaDescription": "Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.",
    "keywords": ["ice rink rentals for events", "holiday activation rentals", "portable ice rink rental", "winter event rentals"],
    "robots": "index, follow",
    "canonicalUrl": "https://iceskatingrinkrentals.com/events-holiday-activations",
    "alternateUrls": [],
    "structuredData": [
      "{\"@context\":\"https://schema.org\",\"@type\":\"WebPage\",\"name\":\"Ice Rink Rentals for Events and Holiday Activations\",\"url\":\"https://iceskatingrinkrentals.com/events-holiday-activations\",\"description\":\"Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.\"}"
    ],
    "openGraph": {
      "og:title": "CMS LIVE: Ice Rink Rentals for Events and Holiday Activations | Ice Skating Rink Rentals",
      "og:description": "Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.",
      "og:type": "website",
      "og:url": "https://iceskatingrinkrentals.com/events-holiday-activations",
      "og:image": "",
      "og:image:alt": "Ice Skating Rink Rentals",
      "og:site_name": "Ice Skating Rink Rentals",
      "og:locale": "en_US"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:title": "CMS LIVE: Ice Rink Rentals for Events and Holiday Activations | Ice Skating Rink Rentals",
      "twitter:description": "Plan ice rink rentals for holiday activations, corporate winter events, town centers, schools, malls, private parties, and seasonal experiences.",
      "twitter:image": "",
      "twitter:site": "",
      "twitter:creator": ""
    }
  },
  "isPublished": true,
  "publishedAt": "2026-05-13T00:00:00Z",
  "includeInSitemap": true
}
```

## Page 3: contact

Cosmos path:

```text
PumpkinCMS / Page / Items / id: ice-rink-rentals-contact
partition key: ice-rink-rentals
```

```json
{
  "id": "ice-rink-rentals-contact",
  "PageId": "ice-rink-rentals-contact",
  "tenantId": "ice-rink-rentals",
  "pageSlug": "contact",
  "PageVersion": 1,
  "Layout": "default",
  "MetaData": {
    "category": "rentals",
    "product": "portable ice rink",
    "keyword": "ice rink rental quote",
    "pageType": "landing",
    "title": "CMS LIVE: Request an Ice Rink Rental Quote",
    "description": "Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.",
    "createdAt": "2026-05-13T00:00:00Z",
    "updatedAt": "2026-05-13T00:00:00Z",
    "author": "Ice Skating Rink Rentals Team",
    "language": "en-us",
    "market": "us"
  },
  "searchData": {
    "state": "",
    "city": "",
    "metro": "",
    "county": "",
    "keyword": "ice rink rental quote",
    "tags": ["Portable Ice Rink Rentals", "portable ice rink rental", "ice rink rental quote", "event rentals"],
    "contentSummary": "Request a Portable Ice Rink Rentals quote by sharing event date, location, venue type, guest count, surface details, rental goals, and add-ons.",
    "blockTypes": ["Hero", "Contact", "CardGrid", "FAQ", "PrimaryCTA"]
  },
  "ContentData": {
    "ContentBlocks": [
      {
        "type": "Hero",
        "content": {
          "type": "Main",
          "headline": "CMS LIVE: Request an Ice Rink Rental Quote",
          "subheadline": "Share your event date, location, venue type, guest count, surface details, rental goals, and add-on needs so the rental planning conversation starts clearly.",
          "backgroundImage": "",
          "backgroundImageAltText": "",
          "mainImage": "",
          "mainImageAltText": "Request an ice rink rental quote",
          "buttonText": "Start Quote Request",
          "buttonLink": "#contact"
        }
      },
      {
        "type": "Contact",
        "content": {
          "id": "contact",
          "title": "Start your quote request",
          "subtitle": "Share the basics below and the rental conversation can start with the details that matter most.",
          "address": "",
          "phone": "",
          "email": "hello@iceskatingrinkrentals.com",
          "hours": "Responses are prioritized by event date, season, and venue readiness.",
          "formFields": [
            { "label": "Name", "type": "text", "required": true, "placeholder": "Your name" },
            { "label": "Email", "type": "email", "required": true, "placeholder": "you@example.com" },
            { "label": "Phone", "type": "tel", "required": false, "placeholder": "Best callback number" },
            { "label": "Event Date", "type": "text", "required": true, "placeholder": "Preferred date or date range" },
            { "label": "Event Location", "type": "text", "required": true, "placeholder": "City, state, and venue" },
            { "label": "Venue Type", "type": "text", "required": false, "placeholder": "School, town center, mall, venue, private property" },
            { "label": "Estimated Attendance", "type": "text", "required": false, "placeholder": "Expected guest count" },
            { "label": "Surface Details", "type": "textarea", "required": false, "placeholder": "Indoor/outdoor, surface type, available space, access notes" },
            { "label": "Rental Goals", "type": "textarea", "required": true, "placeholder": "Tell us about timing, add-ons, and the experience you want to create" }
          ],
          "submitButtonText": "Send Quote Request",
          "socialLinks": []
        }
      },
      {
        "type": "CardGrid",
        "content": {
          "title": "Helpful details for a quote",
          "subtitle": "The more context you can share, the easier it is to understand availability, setup needs, and rental fit.",
          "layout": "grid-3",
          "cards": [
            {
              "title": "Event date",
              "description": "Include your preferred date, backup dates, setup window, operating hours, and teardown expectations.",
              "image": "",
              "image-alt": "",
              "icon": "CalendarCheck",
              "link": "",
              "alt": "Event date"
            },
            {
              "title": "Location",
              "description": "Share the venue address, city, access notes, loading area, and whether the event is public or private.",
              "image": "",
              "image-alt": "",
              "icon": "MapPin",
              "link": "",
              "alt": "Location"
            },
            {
              "title": "Indoor or outdoor",
              "description": "Tell us whether the rink would be inside, outside, covered, or exposed to weather.",
              "image": "",
              "image-alt": "",
              "icon": "Tent",
              "link": "",
              "alt": "Indoor or outdoor"
            },
            {
              "title": "Surface type",
              "description": "Describe the surface, available footprint, slope concerns, power access, and nearby constraints.",
              "image": "",
              "image-alt": "",
              "icon": "Warehouse",
              "link": "",
              "alt": "Surface type"
            },
            {
              "title": "Expected attendance",
              "description": "Estimate guest count, participant volume, event flow, age range, and whether skating is the main attraction.",
              "image": "",
              "image-alt": "",
              "icon": "Users",
              "link": "",
              "alt": "Expected attendance"
            },
            {
              "title": "Add-ons",
              "description": "Mention skate support, attendants, lighting, music, decor, branding, seating, or hospitality needs.",
              "image": "",
              "image-alt": "",
              "icon": "Sparkles",
              "link": "",
              "alt": "Add-ons"
            }
          ]
        }
      },
      {
        "type": "FAQ",
        "content": {
          "title": "Quote request questions",
          "subtitle": "These answers help set expectations before the rental team follows up.",
          "layout": "accordion",
          "items": [
            { "question": "What should I include in a quote request?", "answer": "Include date, location, indoor or outdoor placement, available space, surface type, guest count, rental duration, and add-ons." },
            { "question": "Can I request pricing before all details are final?", "answer": "Yes. Early details can start the conversation, and the rental scope can be refined as the venue, timing, and event goals become clearer." },
            { "question": "Do you need venue photos or layout details?", "answer": "Photos, site maps, measurements, and access notes are helpful because they clarify footprint, surface, loading, and guest-flow needs." },
            { "question": "What happens after I submit the form?", "answer": "The next step is to review availability, venue fit, setup considerations, add-ons, and any details needed to shape quote options." }
          ]
        }
      },
      {
        "type": "PrimaryCTA",
        "content": {
          "title": "Have the basics ready?",
          "description": "Send the event date, location, and venue details so the rental quote process can start with useful context.",
          "buttonText": "Start Quote Request",
          "buttonLink": "#contact",
          "secondaryText": "Still comparing options?",
          "secondaryLinkText": "Review rental planning",
          "secondaryLink": "/ice-rink-rentals",
          "backgroundImage": "",
          "mainImage": "",
          "alt": "Request an ice rink rental quote"
        }
      }
    ]
  },
  "contentRelationships": {
    "isHub": false,
    "hubPageSlug": "ice-rink-rentals",
    "topicCluster": "ice-rink-rentals",
    "relatedHubs": [],
    "spokePriority": 2
  },
  "seo": {
    "metaTitle": "CMS LIVE: Request an Ice Rink Rental Quote | Ice Skating Rink Rentals",
    "metaDescription": "Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.",
    "keywords": ["ice rink rental quote", "portable ice rink rental quote", "ice rink rentals", "portable rink rentals"],
    "robots": "index, follow",
    "canonicalUrl": "https://iceskatingrinkrentals.com/contact",
    "alternateUrls": [],
    "structuredData": [
      "{\"@context\":\"https://schema.org\",\"@type\":\"ContactPage\",\"name\":\"Request an Ice Rink Rental Quote\",\"url\":\"https://iceskatingrinkrentals.com/contact\",\"description\":\"Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.\"}"
    ],
    "openGraph": {
      "og:title": "CMS LIVE: Request an Ice Rink Rental Quote | Ice Skating Rink Rentals",
      "og:description": "Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.",
      "og:type": "website",
      "og:url": "https://iceskatingrinkrentals.com/contact",
      "og:image": "",
      "og:image:alt": "Ice Skating Rink Rentals",
      "og:site_name": "Ice Skating Rink Rentals",
      "og:locale": "en_US"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:title": "CMS LIVE: Request an Ice Rink Rental Quote | Ice Skating Rink Rentals",
      "twitter:description": "Request an ice rink rental quote with your event date, location, venue type, guest count, surface details, and rental goals.",
      "twitter:image": "",
      "twitter:site": "",
      "twitter:creator": ""
    }
  },
  "isPublished": true,
  "publishedAt": "2026-05-13T00:00:00Z",
  "includeInSitemap": true
}
```

## API Verification Commands

Set local variables. Use the existing plain local dev API key from `.env.local`; do not paste it into committed files.

```powershell
$api = "http://localhost:5064"
$tenantId = "ice-rink-rentals"
$apiKey = "<plain-local-api-key>"
$headers = @{ Authorization = "Bearer $apiKey"; Accept = "application/json" }
```

Test each page:

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/ice-rink-rentals" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/events-holiday-activations" -Headers $headers |
  ConvertTo-Json -Depth 80
```

```powershell
Invoke-RestMethod -Uri "$api/api/pages/$tenantId/contact" -Headers $headers |
  ConvertTo-Json -Depth 80
```

Check sitemap entries:

```powershell
Invoke-RestMethod -Uri "$api/api/tenant/$tenantId/sitemap" -Headers $headers |
  ConvertTo-Json -Depth 20
```

Expected API results:

- Each page returns `200 OK`.
- Each response has `tenantId: "ice-rink-rentals"`.
- Each response has the expected `pageSlug`.
- Each response has `isPublished: true`.
- Each hero headline includes `CMS LIVE:`.
- Sitemap contains `home`, `ice-rink-rentals`, `events-holiday-activations`, and `contact`.

## Frontend Verification URLs

Open these after inserting the documents and restarting the frontend if needed:

```text
http://localhost:3002/ice-rink-rentals
http://localhost:3002/events-holiday-activations
http://localhost:3002/contact
http://localhost:3002/sitemap.xml
```

Expected frontend results:

- Each route renders CMS content, not the local fallback copy.
- Each hero headline includes the visible `CMS LIVE:` marker.
- The pages remain styled by the active CMS theme.
- `sitemap.xml` includes the newly seeded page URLs.

## Model And Casing Risks

- Use container `Page`, not `Pages`.
- Use partition key `/tenantId` with value `ice-rink-rentals`.
- Keep `id` and `PageId` present and matching.
- Keep `PageVersion`, `Layout`, `MetaData`, and `ContentData` in PascalCase because `Page.cs` explicitly maps those names.
- Keep `ContentData.ContentBlocks` in PascalCase. The API's polymorphic block converter reads this list into supported block models.
- Keep block `type` values exactly cased: `Hero`, `TrustBar`, `CardGrid`, `HowItWorks`, `FAQ`, `PrimaryCTA`, `Contact`.
- Keep page slugs flat: `ice-rink-rentals`, `events-holiday-activations`, `contact`. The C# `PageSlug` setter replaces slashes with hyphens.
- Current C# `HeroContent` does not define fallback-only fields such as `eyebrow`, `secondaryButtonText`, `secondaryButtonLink`, or `trustLine`. This seed plan does not rely on those fields.
- Open Graph and Twitter metadata use literal keys like `og:title` and `twitter:card`.
- `structuredData` is a list of JSON strings, not objects.

## Cleanup Note

After CMS routing is verified, remove `CMS LIVE:` from:

- `MetaData.title`
- hero `content.headline`
- `seo.metaTitle`
- `seo.openGraph["og:title"]`
- `seo.twitterCard["twitter:title"]`

## Next Step

Insert the three `Page` documents manually into Cosmos Data Explorer, run the API verification commands, then verify the three frontend URLs. Once all pages render from CMS, the next implementation step is to seed or edit these pages through an approved local-only seed helper or the Pumpkin admin UI rather than continuing manual Cosmos edits.
