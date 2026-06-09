# Owner Decision Required List

## Required Before Any CMS Reconciliation Write Plan Can Become Executable

1. Confirm whether the existing active Roller tenant is the intended tenant to preserve/adopt.
2. Decide whether existing `home` content should be adopted as-is or updated from the local Roller package.
3. Decide whether existing `contact` content should be adopted as-is or updated from the local Roller package.
4. Decide how contact form recipient handling should work, because `roller-rink-leads` was not found in refreshed page/index evidence.
5. Decide whether the missing `service-areas` route should be created from the package.
6. Decide the purpose of the existing published `roller-rink-rentals` page: canonical page, supporting page, legacy page, duplicate, or redirect candidate.
7. Decide whether the unpublished duplicate/test page should remain untouched or be addressed by a later cleanup gate.
8. Decide when SEO/sitemap flags should change, because current CMS pages are sitemap-included while local package readiness remains pre-live.
9. Decide whether media should remain package-referenced only or whether later MediaAsset creation/linking should be planned.

## Items That Must Remain Untouched For Now

- Existing CMS tenant/site/domain state.
- Published CMS pages.
- Sitemap/publication flags.
- Unpublished duplicate/test page.
- Form delivery and recipient configuration.
- Media assets.
- Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, and live-page publication.
