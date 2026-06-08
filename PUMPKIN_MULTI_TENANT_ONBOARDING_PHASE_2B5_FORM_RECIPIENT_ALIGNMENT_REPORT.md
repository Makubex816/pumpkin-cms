# Pumpkin Multi-Tenant Onboarding Phase 2B-5 Form Recipient Alignment Report

## Scope

This report records the local/offline form recipient schema, builder, validator, fixture, test, and documentation alignment.

No real tenant was created. No CMS, MediaAsset, Azure, Cloudflare, DNS, deployment, Function setting, email, Microsoft 365, Search Console, sitemap, URL Inspection, indexing, external check, protected config, or Roller action was performed.

## Schema Changes

`form.schema.json` now supports:

- `leadRecipientRef`
- legacy `recipientGroup`
- `staticEndpointRef`
- `domainRoutingKey`

`recipient` is no longer required by schema. It remains allowed as optional legacy/display metadata. `additionalProperties` remains `false`.

## Builder Changes

The builder now:

- requires safe `leadRecipientRef` in form answers
- rejects secret-like recipient refs
- rejects conflicting `leadRecipientRef` and `recipientGroup`
- emits `leadRecipientRef`
- emits matching legacy `recipientGroup`
- omits raw `recipient` email from generated `forms.json`
- includes safe recipient refs in `BUILDER_PACKAGE_SUMMARY.md`

## Validator Changes

The validator now:

- accepts `leadRecipientRef`
- accepts legacy `recipientGroup`
- requires one of those recipient references per form
- validates safe recipient reference shape
- flags secret-like recipient references
- flags conflicting `leadRecipientRef` and `recipientGroup`
- resolves page/block lead recipient references against `leadRecipientRef` or `recipientGroup`
- includes safe recipient refs in support packet JSON and operator handoff

## Fake-Pilot Result

The Example Event Rentals fake-pilot package now generates:

```json
"leadRecipientRef": "example-event-leads",
"recipientGroup": "example-event-leads"
```

The fake-pilot package validates with 0 errors and 0 warnings.

## Test Results

Final local validation:

- builder `npm test`: passed, 34 tests
- builder `npm run check`: passed, including 34 tests
- builder `npm run generate:example`: passed
- builder `npm run validate:generated-example`: passed, validator 0 errors and 0 warnings
- validator `npm test`: passed, 16 tests
- fake-pilot generation/support packet: passed, validator 0 errors and 0 warnings
- JSON parse: passed, 193 scoped JSON files, excluding the intentional invalid-json fixture
- `node --check`: passed, 30 builder/validator source and test files
- `git diff --check`: passed with LF/CRLF warnings only
- trailing whitespace scan: passed, 270 scoped files
- targeted secret scan: passed
- external-call source scan: passed
- scoped protected/raw/generated path check: passed
- generated fake/example `.tmp` package status check: clean/ignored
- generated fake/example `forms.json` raw `recipient` check: passed

## Limitations

- `leadRecipientRef` is still only a package reference; no runtime recipient mapping or endpoint configuration is created.
- No email delivery or external endpoint check is performed.
- Support reports still include local paths for local evidence.
- Real tenant pilot execution still requires separate owner/operator and external-action approvals.

## Readiness Classification

| Item | Status |
| --- | --- |
| Phase 2B-4 fake-pilot rehearsal | complete |
| form recipient alignment | yes |
| fake package generation with leadRecipientRef | yes |
| fake package validation | yes |
| ready for real tenant pilot planning | yes |
| ready for real tenant pilot execution | no |
| external checks implemented | no |
| new tenant created | no |
| external systems changed | no |
| Search Console/indexing affected | no |
| Roller | paused |

Proceed to real tenant pilot planning only. Do not execute a real tenant pilot without separate approval for owner review, support redaction, runtime recipient mapping, form endpoint configuration, and every external action.
