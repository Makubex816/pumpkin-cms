# Renderer Support Audit

## Frontend Data Source

- apps/ice-rink-web/src/app/page.tsx renders the homepage through getPageForRender(site, home).
- apps/ice-rink-web/src/lib/content-source.ts delegates non-static rendering to fetchPage(site, slug).
- apps/ice-rink-web/src/lib/pumpkin-api.ts fetches /api/pages/{tenantId}/{slug} with the site API key and revalidate: 60.
- apps/pumpkin-api/Program.cs documents that endpoint as retrieving a published page by slug.

## Block Rendering

- PageRenderer renders page.ContentData.ContentBlocks.
- PolishedBlocks supports Hero, TrustBar, CardGrid, HowItWorks, FAQ, PrimaryCTA, Contact, and formBlock.
- customHtml blocks fall through to the generic block renderer path.
- PolishedHeroBlock can render content.mainImage, but it renders that media as a CSS background on a div with role=img, not as an img tag.

## Implications

- A frontend HTML probe that finds no img tags does not by itself prove the rich hero media is missing, because the hero renderer uses background images.
- The current homepage response also lacks the /media URLs and rich content markers, so the issue is not merely background-image rendering.
- The frontend currently has no local draft preview read path and no /media rewrite/proxy in next.config.js.
