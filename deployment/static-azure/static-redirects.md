# Static Redirects

Phase 6D adds a page-level redirect manifest for Option C static publishing.

## Page Data Shape

Pages can carry:

```json
{
  "previousSlugs": ["old-page-slug"],
  "redirects": [
    {
      "from": "old-page-slug",
      "to": "new-page-slug",
      "type": 301,
      "reason": "slug_changed",
      "createdAt": "2026-05-19T00:00:00.000Z",
      "createdBy": "Pumpkin CMS Admin",
      "active": true
    }
  ]
}
```

Supported reasons:

- `slug_changed`
- `manual`
- `imported`
- `canonical_cleanup`

## Generated Manifest

Static validation/generation writes:

```text
apps/ice-rink-web/.static-artifacts/{SITE_KEY}/redirects.json
apps/ice-rink-web/.static-artifacts/{SITE_KEY}/out/redirects.json
```

Each record uses public paths:

```json
{
  "from": "/old-page-slug",
  "to": "/new-page-slug",
  "type": 301,
  "sourcePageId": "page-id",
  "sourcePageSlug": "new-page-slug",
  "reason": "slug_changed",
  "active": true
}
```

## Azure Static Web Apps

Azure Static Web Apps can represent redirects in `staticwebapp.config.json` routes. The generated `redirects.json` is the safe source for creating those entries later.

Do not assume redirects are live just because the manifest exists. A future deployment step must translate or copy the redirect rules into the hosting configuration.

## Azure Storage + Cloudflare

Azure Storage static website hosting does not provide the same first-class redirect route file. For that path, use the manifest to create Cloudflare redirect rules or another edge redirect layer.

No Cloudflare rules are created by this repo.

## Validation Warnings

Static validation warns when:

- a previous slug has no active redirect to the current slug
- a redirect loops back to the same path
- duplicate redirect source paths exist
- a canonical URL path does not match the current slug
- an old slug still appears as a sitemap page
- a redirect target is missing or unpublished
- an absolute redirect URL crosses outside the tenant domain

Warnings are advisory unless the generated output would be broken.

## Rollback Notes

Rolling back a page can restore an older slug and will create a new revision before the restore. After rollback, inspect redirect coverage and canonical URLs before publishing static output.

## SEO And Ads Caution

Slug changes can affect backlinks, indexed URLs, internal links, and Google Ads final URLs. Published slug changes should be rare, reviewed, and followed by a static rebuild plus deployment verification.
