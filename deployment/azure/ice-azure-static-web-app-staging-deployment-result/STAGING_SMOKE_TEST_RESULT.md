# Staging Smoke Test Result

Generated: 2026-06-06

## Summary

Content, route, media, asset, sitemap, robots, and not-found smoke checks passed on the Azure default hostname.

Form UI wiring is present. The original deployment smoke test found the Azure default hostname was not yet allowed by the static contact Function CORS/origin policy. A later approved CORS/origin enablement pass resolved that blocker.

## Passing Checks

| Check | Result |
| --- | --- |
| `/` | 200 |
| `/contact` | 200 |
| `/service-areas` | 200 |
| `/sitemap.xml` | 200 |
| `/robots.txt` | 200 |
| missing route | 404 |
| `/ice-rink-rentals` | 404 |
| `/events-holiday-activations` | 404 |
| static assets | 15 checked, all 200 |
| media URLs | 9 checked, all 200 |
| approved page `noindex` | absent |
| `latestSnapshot` | absent |
| `CMS LIVE` | absent |
| local media references | absent |
| localhost in approved page HTML | absent |
| Roller strings in approved page HTML | absent |
| contact form endpoint string | present |

## Form OPTIONS Check

Safe non-email `OPTIONS` checks:

| Origin | Status | Allow-Origin |
| --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | none |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` |

No valid contact form payload was submitted. No email was sent.

## Subsequent CORS Resolution

After the later approved CORS/origin enablement pass:

| Origin | Status | Allow-Origin |
| --- | --- | --- |
| `https://happy-mud-0b375e20f.7.azurestaticapps.net` | 204 | `https://happy-mud-0b375e20f.7.azurestaticapps.net` |
| `https://iceskatingrinkrentals.com` | 204 | `https://iceskatingrinkrentals.com` |
| `https://www.iceskatingrinkrentals.com` | 204 | `https://www.iceskatingrinkrentals.com` |

An invalid empty JSON POST from the staging origin returned 400 with the staging allow-origin header. No valid form lead was submitted and no email was sent.

## Result Classification

| Area | Status |
| --- | --- |
| static content staging smoke | pass |
| media smoke | pass |
| asset smoke | pass |
| route/not-found smoke | pass |
| form UI smoke | pass |
| staging-origin browser form readiness | pass after later CORS enablement |
