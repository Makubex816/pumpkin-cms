# Contact Form Endpoint Discovery

Result: endpoint discovered, but live endpoint returned 405 when exercised.

Public contact page form:

- Form count: 1.
- Static `action`: none.
- Static `method`: none.
- Submit behavior is JavaScript-handled.

Sources inspected:

- Live public contact page HTML from `https://iceskatingrinkrentals.com/contact`.
- Public JS assets referenced by that contact page.
- Local public app source files:
  - `apps/ice-rink-web/src/components/PageRenderer.tsx`
  - `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
  - `apps/ice-rink-web/src/app/api/contact/route.ts`

Discovery:

- The public app runtime submit path is `/api/contact`.
- The renderer can use `staticFormEndpoint` or `staticFormAction` in static mode.
- The live form markup did not expose a static action endpoint.
- Public JS chunk `/_next/static/chunks/938-7f8e623d5f937f5a.js` includes runtime `/api/contact` submit logic and static endpoint fallback logic.
- Public JS chunk `/_next/static/chunks/117-6e9f3a98d8d9e825.js` includes form definition metadata with runtime submit path `/api/contact`.

Endpoint selected for the single approved POST:

- `https://iceskatingrinkrentals.com/api/contact`

Important result:

- The selected endpoint returned HTTP 405 to the single approved POST.
- No second endpoint was attempted after the sent POST.
- No retry was attempted.
