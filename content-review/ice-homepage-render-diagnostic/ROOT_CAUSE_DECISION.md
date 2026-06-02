# Root Cause Decision

## Primary Root Cause

E - public frontend is rendering the published/simple homepage, while the redesigned homepage exists only as a local CMS draft.

The redesigned homepage exists in the local draft readback artifact with 10 rich blocks and MediaAsset-backed media URLs. The public root route uses the public published-page API path, so it returns the currently published/simple homepage instead of the draft.

## Secondary Root Cause

D - local /media paths are available on the API host but 404 on the frontend host because the frontend has no /media proxy/rewrite.

The media URLs referenced by the draft are relative /media/... paths. They return 200 from the API host but 404 from the frontend host.

## Ruled Out Or Not Primary

- A - wrong candidate imported: no. The import report selected HOMEPAGE_BUSINESS_READY_CANDIDATE.json and the readback root page matches the rich candidate shape.
- B - candidate lacks renderable media refs: no for the imported draft. It contains Hero.content.mainImage and media URLs.
- C - renderer lacks all support: partial only. It supports the main polished block types and Hero mainImage, but customHtml falls back and relative media URLs still need hosting/proxy support.
- F - cache only: unlikely as the main cause. The frontend fetches a published page endpoint; revalidate caching can delay updates but cannot make an unpublished draft appear.
- G - contact correction homepage skip: not causal. That package intentionally skipped homepage writes and did not overwrite the earlier rich draft.

## Classification

- Primary classification: E - frontend rendering published/old content rather than current draft.
- Secondary classification: D - media URLs unavailable from the frontend host.
- Renderer support issue: partial supporting concern, not the first blocker.
- Cache issue: possible minor delay source, not the root cause.
