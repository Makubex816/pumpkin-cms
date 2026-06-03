# Ice Service Areas Draft Preview Support

Created: 2026-06-03

This package documents the local draft preview support added for the Ice Skating Rink Rentals `/service-areas` page.

## Scope

- Added a local draft preview route for `/service-areas`.
- Added a `__preview` rewrite alias for service areas.
- Reused the homepage preview auth and rendering behavior through a shared preview client.
- Preserved public `/service-areas` behavior; it remains unpublished and returns 404.
- No CMS writes, imports, static generation, deployment, provider, DNS, email, Theme, MediaAsset, or Roller action occurred.

## Preview URL

http://localhost:3002/__preview/ice-rink-rentals/service-areas

The preview still requires a local admin JWT to load draft CMS data in the browser.
