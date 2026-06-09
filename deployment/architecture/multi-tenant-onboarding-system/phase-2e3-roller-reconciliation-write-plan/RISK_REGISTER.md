# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Existing published pages are overwritten by slug | live content regression | preserve by default; require field-level owner-approved deltas |
| `service-areas` create publishes content unexpectedly | live-page hard stop violated | require draft/unpublished path or block write |
| `roller-rink-rentals` purpose is misunderstood | duplicate/canonical confusion | owner decision gate before any write |
| Form recipient storage remains unknown | broken or unsafe contact form | block form writes until storage and mapping are proven |
| SEO/sitemap flags change as side effect | indexing/readiness drift | separate SEO/sitemap gate; preserve by default |
| Media assets are created without rights/review | asset compliance issue | no MediaAsset writes without separate approval |
| Rollback evidence incomplete | recovery is weak | require before-state capture before execution |
| Fresh preflight state differs from Phase 2E-2 | stale plan | abort and re-plan |
| Write command scope is too broad | unrelated tenant/page changes | block until exact entity/field scope is enforceable |
| Request includes external platform actions | hard-stop violation | reject deployment/DNS/Azure/Cloudflare/email/Search Console/indexing/live-page work |

## Current Risk Level

Medium for planning, high for execution. Execution remains blocked until Phase 2E-4 and a later explicit write execution approval prove scope, rollback, and readback controls.
