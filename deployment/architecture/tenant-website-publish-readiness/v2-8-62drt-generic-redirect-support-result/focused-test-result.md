# Focused Test Result

| Suite | Result |
| --- | --- |
| API redirect source runner | passed, 53 assertions |
| Redirect semantic validator | passed, 7 checks |
| Tenant redirect import planner | passed; create/resume plus 7 safety classes |
| Page contract regression | passed, 6 checks |
| Actual Vegas planned page contract | passed, 43 pages, 0 errors, 0 warnings |
| Starter redirect runtime | passed |
| Starter TypeScript type-check | passed |
| Starter production build | passed, exit 0 |

API tests cover CRUD preparation, idempotence, source immutability, all supported status codes, query preservation, tenant/API-key scope, authorization, duplicate source, page conflict, pending target safety, internal/external classification, self/two/multi-node cycles, backup round-trip, cross-tenant restore denial, and provider/route source contracts.

The post-deploy Linux defect was added to the source test contract: internal path classification may not use platform-specific absolute file-URI detection.
