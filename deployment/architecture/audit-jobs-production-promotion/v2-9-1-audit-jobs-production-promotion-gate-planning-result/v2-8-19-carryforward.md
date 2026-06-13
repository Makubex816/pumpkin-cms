# V2.8.19 Carryforward

Result: passed.

V2.8.19 is the carryforward anchor for V2.9.1.

| Field | Value |
| --- | --- |
| Source reference | `V2.8.19` |
| Classification | `contact_form_verified_indexing_deferred_v2_8_complete` |
| Production target | `swa-ice-static-staging` |
| Resource group | `rg-ice-static-staging` |
| Deployment id | `96fd744f-5589-4ac3-bebb-cfa99048dc0e` |
| Artifact run | `sanitized_20260613174033` |
| Artifact aggregate SHA-256 | `506c6b4c99bcabed162466c79b299f900c6070855b90cd6f38ffae37fceff899` |
| Production route verification | six `200 OK` responses |
| Contact form verification | one synthetic non-PII POST, `200 OK`, `ok=true`, entry ID present |
| Indexing status | `deferred_hard_stop` |

Carryforward paths:

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_19_CONTACT_FORM_LIVE_SUBMISSION_INDEXING_HARD_STOP_DEFERRAL_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-19-contact-form-live-submission-indexing-hard-stop-deferral-result/`

V2.9.1 did not rerun route checks, submit contact forms, call Search Console, inspect URLs, request indexing, deploy, or mutate any provider/resource.

