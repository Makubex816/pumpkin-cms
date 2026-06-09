# Proposed Write Operation Summary

All operations below are future-only proposals. None were executed in Phase 2E-3.

## Future Operation Batches

| Batch | Entity | Future operation | Default posture | Required approval |
| --- | --- | --- | --- | --- |
| 0 | tenant/site/domain | no write; preserve/adopt existing active tenant | preserve | owner confirmation |
| 1 | rollback snapshots | read and save sanitized before-state evidence | required before writes | Phase 2E-4 preflight |
| 2 | `home` | optional page update only for owner-approved content/metadata deltas | adopt existing if acceptable | CMS write execution approval |
| 3 | `contact` | optional page update only for owner-approved content/form/metadata deltas | adopt existing if acceptable | CMS write execution approval |
| 4 | `service-areas` | create missing page from approved package content | create as unpublished/not sitemap-included unless later approved otherwise | CMS write execution approval |
| 5 | `roller-rink-rentals` | no-op, update, redirect plan, or preserve based on owner decision | preserve | owner purpose decision plus later approval |
| 6 | form recipient | no write unless recipient storage and desired mapping are proven | blocked | form owner and CMS write approval |
| 7 | SEO/sitemap | no change unless owner approves exact SEO/sitemap deltas | preserve | separate SEO/sitemap gate |
| 8 | media refs/assets | no MediaAsset write; optional later linking only if approved | preserve package refs | MediaAsset write approval |
| 9 | post-write readback | GET-only verification of exact touched entities | required after any write | write execution gate |

## Future Write Intent Details

| Entity | Future write intent |
| --- | --- |
| Existing active tenant | Do not create or replace. Adopt existing tenant shell if owner confirms it is intended. |
| Site/domain metadata | Do not change during reconciliation writes unless Phase 2E-4 finds a specific mismatch and owner approves. |
| `home` | Preserve slug and record identity. Update only owner-approved content/layout/metadata fields. Preserve published and sitemap state by default. |
| `contact` | Preserve slug and record identity. Update only owner-approved content/layout/form/metadata fields. Preserve published and sitemap state by default. |
| `service-areas` | Create exactly one missing page with slug `service-areas` and route `/service-areas/` from approved source content. Default to unpublished and not sitemap-included if CMS supports safe draft state. |
| `roller-rink-rentals` | No write unless owner decides its purpose and approves exact action. |
| Form recipient | No recipient write until registry/storage location is confirmed. |
| SEO/sitemap | Preserve current state. Later SEO changes require a distinct gate. |
| Media | No MediaAsset creation. Later media writes require a distinct gate. |

## Abort Rule

Abort any later execution if the write command cannot limit writes to owner-approved entities and fields.
