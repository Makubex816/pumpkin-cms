# Staging Smoke Test Result

Generated: 2026-06-06

## Summary

Content, route, media, asset, sitemap, robots, and not-found smoke checks passed on the Azure default hostname.

Form UI wiring is present, but browser form submission from the Azure default hostname is blocked until the Function allowed-origin policy includes the staging hostname or a later approval chooses another form-testing path.

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

## Result Classification

| Area | Status |
| --- | --- |
| static content staging smoke | pass |
| media smoke | pass |
| asset smoke | pass |
| route/not-found smoke | pass |
| form UI smoke | pass |
| staging-origin browser form readiness | blocked |
