# Pumpkin Airstrip Public Preview Readiness V2.8.58D

Public/read-only readiness result:

- Public FormDefinition read for `airstrip-reservation`: ready, HTTP 200.
- Public theme read: ready, HTTP 200.
- Public sitemap read: route available, HTTP 200.
- Public page reads: not ready.

Public page blocker:

`public_page_api_blocked_by_unpublished_airstrip_pages`.

The source public page endpoint reads only pages where `isPublished=true`. Airstrip currently has five CMS pages with:

- `isPublished:false`
- `includeInSitemap:false`
- `staticPublishing.needsRebuild:true`

V2.8.59 should explicitly approve the isolated-only page publish/readiness strategy before attempting public page proof. This should remain isolated-preview scoped unless a later phase approves production cutover.
