# CMS Import Readiness Matrix

CMS import is not approved.

| Gate | Status | Blocks CMS Import | Reason | Required Resolution |
| --- | --- | --- | --- | --- |
| .NET Page contract | pending rerun for 8C.13 | yes until passed | Must pass for production-bound JSON. | Run Phase 8C.11C tool against this folder. |
| Safe tenant/domain/routes | resolved | no | Safe constants are present. | None. |
| Lead recipient ref | resolved | no | Non-secret reference is present. | Confirm real routing outside page JSON before production. |
| Static endpoint ref | resolved | no | Non-secret reference is present. | Confirm real endpoint outside page JSON before production. |
| Visible contact formBlock | resolved | no | `contact-quote-form` is preserved. | Keep during import. |
| Public phone decision | unresolved | yes | Prompt value is TBD. | Provide approved phone or approval to omit. |
| Public email/display decision | unresolved | yes | Prompt value is TBD. | Provide approved email/display policy or approval to keep form-only. |
| Legal/business display name | unresolved | yes | Prompt value is TBD. | Provide approved display name. |
| Primary service area wording | unresolved | yes | Prompt value is TBD. | Provide approved wording or approve omission. |
| Primary region wording | unresolved | yes | Prompt value is TBD. | Provide approved wording or approve omission. |
| Quote CTA wording | unresolved | yes | Draft exists, no human approval. | Approve or revise copy. |
| Required media slots | unresolved | yes | 15 MediaAsset IDs are missing. | Upload/select approved MediaAssets or remove slots by approval. |
| Human approvals | unresolved | yes | No approval record exists. | Record content/design/SEO/form/media/technical approvals. |
| Admin import/export preflight | not run | yes | Must run after approvals. | Run dry-run preflight; do not write CMS until passed. |
| Target city page | not included | no | No target city approved; no city page is part of this package. | Resolve later only if city page is requested. |

## CMS Import Decision

Ready for CMS import: no.
