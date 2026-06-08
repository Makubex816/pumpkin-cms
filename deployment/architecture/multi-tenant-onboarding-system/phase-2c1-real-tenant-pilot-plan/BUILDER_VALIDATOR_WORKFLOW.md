# Builder And Validator Workflow

The first real tenant pilot uses the existing local/offline builder and validator as evidence-producing tools only.

## Builder Responsibilities

The builder should:

- read a non-secret answers JSON file
- reject missing required answers
- reject unsafe URLs and secret-like values
- preserve `leadRecipientRef`
- preserve legacy `recipientGroup` compatibility where required
- generate an import package candidate in a local ignored output folder
- run the offline validator when requested
- write validation and support reports

The builder must not create tenants, write CMS records, change external systems, send email, or call public services.

## Validator Responsibilities

The validator should check:

- required files exist
- JSON files parse
- schemas validate
- cross-file references resolve
- route, media, form, and SEO references are consistent
- URL values follow safety rules
- owner contact and approval files include required gate owners
- support packet output is redacted

The validator must remain offline. It must not check DNS, Cloudflare, Azure, CMS, MediaAsset records, forms, email delivery, Search Console, indexing, or public endpoints.

## Expected Gate Statuses

| Status | Meaning | Dry-run result |
| --- | --- | --- |
| `passed` | Requirement is satisfied. | Can continue review. |
| `warning` | Review item exists but may be acceptable. | Owner/operator must decide. |
| `manual_review_required` | Human approval is needed. | Cannot be treated as technical approval. |
| `blocked` | Required safety or completeness condition failed. | Stop. |
| `failed` | Validation could not complete or package is invalid. | Stop. |
| `not_run` | Check did not run. | Stop unless explicitly justified. |

## Passing Dry Run

A successful first real tenant dry run should produce:

- no `failed` statuses
- no `blocked` statuses
- no secret findings
- no external-mutation findings
- clear owner review items
- clear operator handoff notes
- clear final indexing hard stop

Warnings and manual-review items may remain, but they must be documented and accepted before any later import planning.
