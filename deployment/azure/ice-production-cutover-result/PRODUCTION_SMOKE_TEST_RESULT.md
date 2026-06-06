# Production Smoke Test Result

Generated: 2026-06-06

## Summary

Production smoke tests passed for apex and `www`.

## Route Checks

| URL | Status | Result |
| --- | --- | --- |
| `https://iceskatingrinkrentals.com/` | 200 | pass |
| `https://iceskatingrinkrentals.com/contact` | 200 | pass |
| `https://iceskatingrinkrentals.com/service-areas` | 200 | pass |
| `https://iceskatingrinkrentals.com/sitemap.xml` | 200 | pass |
| `https://iceskatingrinkrentals.com/robots.txt` | 200 | pass |
| `https://iceskatingrinkrentals.com/ice-rink-rentals` | 404 | pass |
| `https://iceskatingrinkrentals.com/events-holiday-activations` | 404 | pass |
| `https://iceskatingrinkrentals.com/this-route-should-not-exist-20260606` | 404 | pass |
| `https://www.iceskatingrinkrentals.com/` | 200 | pass |
| `https://www.iceskatingrinkrentals.com/contact` | 200 | pass |
| `https://www.iceskatingrinkrentals.com/service-areas` | 200 | pass |
| `https://www.iceskatingrinkrentals.com/sitemap.xml` | 200 | pass |
| `https://www.iceskatingrinkrentals.com/robots.txt` | 200 | pass |
| `https://www.iceskatingrinkrentals.com/ice-rink-rentals` | 404 | pass |
| `https://www.iceskatingrinkrentals.com/events-holiday-activations` | 404 | pass |
| `https://www.iceskatingrinkrentals.com/this-route-should-not-exist-20260606` | 404 | pass |

## Page Content Checks

| Check | Result |
| --- | --- |
| Ice brand text present | pass |
| page titles present | pass |
| canonical URLs rooted at `https://iceskatingrinkrentals.com` | pass |
| approved pages do not contain `noindex` | pass |
| `latestSnapshot` absent | pass |
| `CMS LIVE` absent | pass |
| localhost references absent | pass |
| local media paths absent | pass |
| Roller brand strings absent | pass |
| Azure staging hostname absent from production page HTML | pass |
| static contact endpoint present on `/contact` | pass |

## Asset and Media Checks

| Area | Result |
| --- | --- |
| `_next` static assets | 30 discovered, 30 checked, 0 failures |
| media URLs | 9 discovered, 9 checked, 0 failures |
| media host | `media.iceskatingrinkrentals.com` |

## Sitemap and Robots

| File | Result |
| --- | --- |
| `sitemap.xml` | 3 production apex URLs, no `www`, no staging host |
| `robots.txt` | references `https://iceskatingrinkrentals.com/sitemap.xml`, no staging host |

## Form OPTIONS Checks

Safe `OPTIONS` checks only:

| Endpoint | Origin | Status | Allow-Origin | Allow-Methods | Allow-Headers |
| --- | --- | --- | --- | --- | --- |
| `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` | `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |
| `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` | `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` | `OPTIONS, POST` | `Content-Type` |

No valid form payload was submitted. No email was sent.
