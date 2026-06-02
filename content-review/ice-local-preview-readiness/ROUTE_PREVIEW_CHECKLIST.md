# Route Preview Checklist

Use this checklist after the local services are running. Keep checks read-only unless a later task explicitly authorizes form submission or CMS writes.

## `/`

- URL: `http://localhost:3002/`
- Expected current behavior: renders the current CMS homepage if API credentials and published CMS content are available; otherwise renders the local Ice fallback homepage.
- Important: this route does not automatically render `content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json`.
- Check:
  - Page loads without a 500.
  - Header/navigation render.
  - No raw candidate media placeholders are exposed as fake public URLs.
  - Any quote form is inspected visually only.

## `/contact`

- URL: `http://localhost:3002/contact`
- Expected current behavior: renders the CMS contact page if available; otherwise renders local fallback contact content.
- Check:
  - Page loads without a 500.
  - Contact/quote form appears if available.
  - Do not submit a real lead unless a separate dry-run form test is explicitly authorized.

## `/service-areas`

- URL: `http://localhost:3002/service-areas`
- Expected current behavior: renders a CMS service-areas page only if one exists and API credentials/content are available.
- Current fallback note: no `service-areas` fallback page was found in `apps/ice-rink-web/src/data/fallback-pages.ts`.
- Check:
  - A 404 is acceptable when the API/CMS page is unavailable.
  - Contact and service-area content remain on hold.

## Admin Preview Links

Existing admin preview helpers point Ice pages to `http://localhost:3002`, but they preview existing page records by route. They do not make an arbitrary local JSON candidate visible unless that candidate has been imported or a dedicated preview flow exists.

