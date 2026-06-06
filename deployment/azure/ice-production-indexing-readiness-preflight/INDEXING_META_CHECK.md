# Indexing Meta Check

Generated: 2026-06-06

## Approved Pages

| URL | Status | Robots | Canonical | Title | Description | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `https://iceskatingrinkrentals.com/` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/` | present | present | pass with hidden metadata risk |
| `https://iceskatingrinkrentals.com/contact` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/contact/` | present | present | pass with hidden metadata risk |
| `https://iceskatingrinkrentals.com/service-areas` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/service-areas/` | present | present | pass with hidden metadata risk |
| `https://www.iceskatingrinkrentals.com/` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/` | present | present | pass with hidden metadata risk |
| `https://www.iceskatingrinkrentals.com/contact` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/contact/` | present | present | pass with hidden metadata risk |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 | `index,follow` | `https://iceskatingrinkrentals.com/service-areas/` | present | present | pass with hidden metadata risk |

## Negative Checks

| Check | Result |
| --- | --- |
| `noindex` absent | pass |
| `latestSnapshot` absent | pass |
| `CMS LIVE` absent | pass |
| localhost absent | pass |
| local `/media/ice-rink-rentals` paths absent | pass |
| Roller brand strings absent | pass |
| high-confidence secret-like strings absent | pass |
| Open Graph/Twitter image URLs | omitted safely |
| rendered/body images use `media.iceskatingrinkrentals.com` | pass |

## Hidden Metadata Risk

The production HTML includes serialized CMS workflow/review payload text that is not an indexing directive, but should be cleaned up or explicitly accepted before Search Console submission:

| Page | Finding |
| --- | --- |
| `/` | hidden payload contains `draft` and repeated `needs_review` strings |
| `/contact` | hidden payload contains `draft`, repeated `needs_review`, and `Static generation and production indexing are not authorized` |
| `/service-areas` | hidden payload contains `draft` and repeated `needs_review` strings |

## Interpretation

Search engines should follow the page-level `index,follow` metadata and apex canonical tags. However, stale serialized launch/review text in production HTML is a search-readiness risk because it contradicts the intended production/indexing state.

## Result

Indexing meta directives pass. Immediate Search Console submission is not recommended until the hidden metadata risk is resolved or explicitly accepted.
