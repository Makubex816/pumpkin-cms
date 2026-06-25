# Public Contact Email Source Update

Result: complete.

Canonical public contact email:

`contact@iceskatingrinkrentals.com`

Updated source:

- `apps/ice-rink-web/src/config/sites.ts`
  - `publicContactEmail: 'contact@iceskatingrinkrentals.com'`
  - `mailtoLinksEnabled: true`
- `apps/ice-rink-web/src/data/ice-rink-media.ts`
  - exports `ICE_PUBLIC_CONTACT_EMAIL`
- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`
  - recovered page domain routing and contact block use the canonical public email
- `apps/ice-rink-web/src/data/fallback-home.ts`
  - generic public fallback changed from `hello@{{domain}}` to `contact@{{domain}}`
- `apps/ice-rink-web/src/data/fallback-pages.ts`
  - generic public fallback changed from `hello@{{domain}}` to `contact@{{domain}}`

Contact backend recipient was not read or changed.
