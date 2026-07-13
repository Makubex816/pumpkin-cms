# V2.8.62F Preview Implementation Plan

Goal: implement and prove `/preview/strip-club-near-me-vegas` from a package-derived immutable fixture, then permit at most one separately approved starter deployment attempt. Keep forms no-post and the tenant unpublished/noindex.

## Source Scope

- `apps/starter-app/package.json`
- `apps/starter-app/package-lock.json`
- `apps/starter-app/scripts/build-compiled-preview-fixture.mjs`
- `apps/starter-app/scripts/validate-compiled-preview-fixture.mjs`
- `apps/starter-app/src/lib/preview-fixtures.ts`
- `apps/starter-app/src/lib/preview-fixture-redirects.ts`
- `apps/starter-app/src/components/PreviewBehaviorAdapter.tsx`
- `apps/starter-app/src/components/PackageStaticHeader.tsx`
- `apps/starter-app/src/components/PackageStaticFooter.tsx`
- `apps/starter-app/src/components/PageRenderer.tsx`
- `apps/starter-app/src/components/SiteHeader.tsx`
- `apps/starter-app/src/components/SiteFooter.tsx`
- `apps/starter-app/src/lib/site-chrome.ts`
- `apps/starter-app/src/app/preview/[tenantId]/[[...slug]]/page.tsx`
- `apps/starter-app/public/themes/strip-club-near-me-vegas-reference.css`
- `apps/starter-app/public/tenant-adapters/strip-club-near-me-vegas-fidelity-v1.js`
- `apps/starter-app/test/preview-fixtures.test.mjs`
- `apps/starter-app/test/vegas-preview-contract.test.mjs`
- `apps/starter-app/test/vegas-preview-browser-proof.mjs`

The builder must use a real HTML parser for HTML attributes and PostCSS-compatible parsing for CSS URLs. It must reject script tags, inline event handlers, `javascript:` URLs, missing aliases, unresolved internal links, and any fixture count drift. It must map all 473 source aliases to the 302 live blob URLs, preserve external/mailto/tel/anchor/download semantics, prefix internal preview links, and include all 32 FormDefinitions/65 mappings.

The allowlisted behavior adapter must be hash-pinned to the audited CR source. It must preserve the session-only age acknowledgement, mobile menu, quiz, query prefill, no-post success UI, external-navigation hold, and 30 image fallbacks without executing uploaded JavaScript or storing personal data.

## Preview Routes

- `/preview/strip-club-near-me-vegas`
- `/preview/strip-club-near-me-vegas/24-hour-late-night-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/404.html`
- `/preview/strip-club-near-me-vegas/advertising-disclosure`
- `/preview/strip-club-near-me-vegas/bachelor-party-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/best-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs`
- `/preview/strip-club-near-me-vegas/clubs/airstrip-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/crazy-horse-3`
- `/preview/strip-club-near-me-vegas/clubs/hustler-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/little-darlings-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/palomino-club-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/peppermint-hippo-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/sapphire-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/scores-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/spearmint-rhino-las-vegas`
- `/preview/strip-club-near-me-vegas/clubs/treasures-las-vegas`
- `/preview/strip-club-near-me-vegas/contact`
- `/preview/strip-club-near-me-vegas/couples-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/editorial-policy`
- `/preview/strip-club-near-me-vegas/free-limo-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/guides`
- `/preview/strip-club-near-me-vegas/guides/24-hour-late-night-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/guides/bachelor-parties`
- `/preview/strip-club-near-me-vegas/guides/bachelor-party-planning`
- `/preview/strip-club-near-me-vegas/guides/best-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/guides/couples-guide-vegas`
- `/preview/strip-club-near-me-vegas/guides/couples-night`
- `/preview/strip-club-near-me-vegas/guides/dress-code`
- `/preview/strip-club-near-me-vegas/guides/dress-code-what-to-expect`
- `/preview/strip-club-near-me-vegas/guides/first-time-visitor`
- `/preview/strip-club-near-me-vegas/guides/free-limo-guide`
- `/preview/strip-club-near-me-vegas/guides/gentlemens-club-vs-strip-club`
- `/preview/strip-club-near-me-vegas/guides/how-many-strip-clubs-las-vegas`
- `/preview/strip-club-near-me-vegas/guides/las-vegas-strippers-101`
- `/preview/strip-club-near-me-vegas/guides/prices-deals`
- `/preview/strip-club-near-me-vegas/guides/safety-etiquette`
- `/preview/strip-club-near-me-vegas/guides/strip-club-scams-avoid-vegas-taxis-uber`
- `/preview/strip-club-near-me-vegas/guides/vip-bottle-service`
- `/preview/strip-club-near-me-vegas/guides/vip-rooms`
- `/preview/strip-club-near-me-vegas/guides/what-to-expect`
- `/preview/strip-club-near-me-vegas/las-vegas-strip-club-prices`
- `/preview/strip-club-near-me-vegas/strip-clubs-near-the-strip`

All three source redirects must resolve to the corresponding prefixed preview target before page rendering. No API-key redirect lookup is used on `/preview`.

## Build And Local Proof

From `apps/starter-app`:

1. Run `node scripts/build-compiled-preview-fixture.mjs --tenant strip-club-near-me-vegas --backup <approved-62e-backup> --output <ignored-staging-root>`.
2. Run `node scripts/validate-compiled-preview-fixture.mjs --tenant strip-club-near-me-vegas --fixture <ignored-fixture>`.
3. Run `node test/tenant-redirect-runtime.test.mjs`.
4. Run `node test/preview-fixtures.test.mjs`.
5. Run `node test/vegas-preview-contract.test.mjs`.
6. Run `npm run type-check`.
7. Run `npm run build` with the fixture included before build.
8. Start the local production build and run Playwright at 375x812, 390x844, 768x1024, and 1366x900.

Acceptance requires 172/172 route renders, 12/12 redirect viewport proofs, 1,057/1,057 physical controls, 1,108/1,108 effective controls, zero broken images, zero overflow/clipped-text failures, zero POSTs, zero Airstrip requests, exact titles/H1s, and no generic fallback.

## Deployment Boundary

If separately approved in V2.8.62F, build one protected-config-excluded starter package containing both the existing Party Pros fixture and the new Vegas fixture. Verify the package before exactly one starter deployment attempt. Do not mutate appsettings. If deployment or activation fails, stop; no second attempt without new owner approval.

DNS, nameservers, custom-domain binding, TLS, public publish, indexing, runtime-key activation, form E2E, API deploy, Admin deploy, Ice deploy, Party Pros mutation, and Airstrip action remain outside V2.8.62F.
