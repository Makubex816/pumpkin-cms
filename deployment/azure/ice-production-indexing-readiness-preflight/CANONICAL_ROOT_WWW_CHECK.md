# Canonical Root and WWW Check

Generated: 2026-06-06

## Result

| Area | Result |
| --- | --- |
| apex host | serves 200 |
| `www` host | serves 200 |
| `www` to apex redirect | not configured |
| canonical strategy | canonical-only |
| canonical host | `https://iceskatingrinkrentals.com` |
| matches production cutover plan | yes |

## Canonical Tags

| URL Checked | Canonical |
| --- | --- |
| `https://iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` |
| `https://iceskatingrinkrentals.com/contact` | `https://iceskatingrinkrentals.com/contact/` |
| `https://iceskatingrinkrentals.com/service-areas` | `https://iceskatingrinkrentals.com/service-areas/` |
| `https://www.iceskatingrinkrentals.com/` | `https://iceskatingrinkrentals.com/` |
| `https://www.iceskatingrinkrentals.com/contact` | `https://iceskatingrinkrentals.com/contact/` |
| `https://www.iceskatingrinkrentals.com/service-areas` | `https://iceskatingrinkrentals.com/service-areas/` |

## Readiness Note

`www` serves equivalent content and declares apex canonicals. No redirect rule was approved or configured in this preflight.

The sitemap lists the same approved production pages without trailing slashes. That is not a route failure, but aligning sitemap URLs to canonical tag URLs would reduce indexing ambiguity before submission.
