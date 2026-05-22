# Pumpkin CMS Phase 7E: Roller Local Copy Cleanup Report

## Summary

Phase 7E repaired Roller Rink Rentals CMS source Page data that still contained local-proof, local-dev, localhost, proof, and test-oriented page copy after the Phase 7D fresh static regeneration.

Updated CMS source pages:

- `contact`
- `home`
- `roller-rink-rentals`

Result:

- All known targeted local-proof/local-dev/localhost/test/proof phrases were removed from the current CMS source records.
- Embedded latest revision snapshot page data was also sanitized so stale copy is not preserved inside the Page document payload.
- Revision metadata remains present, with rollback marked available.
- `staticPublishing.needsRebuild` remains `true`, as expected after source content repair.
- Static packages were not regenerated in Phase 7E.

## Starting State

`git status --short` was clean at the start of Phase 7E.

Reviewed:

- `PUMPKIN_POST_REPAIR_STATIC_REGENERATION_PHASE7D_REPORT.md`
- `PUMPKIN_PAGE_QUALITY_REPAIR_EXECUTION_PHASE7C_REPORT.md`
- `apps/ice-rink-web/.static-content-snapshots/roller-rink-rentals/pages/*.json`
- `.static-release-dry-runs/2026-05-22-1321/roller-rink-rentals`

The Phase 7D package remains a stale generated output and still contains old Roller copy until a new regeneration is run.

## Protected Config / Secret Handling

`apps/ice-rink-web/.env.local` was read only for the approved purpose of loading current-process local CMS/API variables.

Variables checked by `PRESENT` / `MISSING` status only:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `ROLLER_RINK_RENTALS_API_KEY`
- `ICE_RINK_RENTALS_TENANT_ID`
- `ROLLER_RINK_RENTALS_TENANT_ID`

For the follow-up metadata cleanup pass, only the Roller/API variables were needed and were again reported by `PRESENT` / `MISSING` status only.

No secret values were printed, copied into this report, or committed.

Protected files were not modified:

- `apps/ice-rink-web/.env.local`
- `apps/pumpkin-api/appsettings.Development.json`

## Offending Phrases Found

The offending source phrases were found in Roller CMS snapshot/generated output and then repaired in CMS source data.

Representative offending phrases:

- "Use this form to test tenant-specific Roller Rink Rentals submissions in the planning environment."
- "Use this form to test tenant-specific Roller Rink Rentals submissions in the local proof environment."
- "planning submissions are for testing only."
- "Local proof submissions are for testing only."
- "Use generic test data while validating the local roller tenant."
- "Where should a test submission appear?"
- "No. Use generic local test details until the production process is ready."
- "Roller Rink Rentals contact proof"
- "Use the contact page to test tenant-specific form submissions for Roller Rink Rentals."
- "Roller rink rental proof questions"
- "Clear details for local proof requests"
- "Use this local proof content to test a separate Roller Rink Rentals tenant, theme, sitemap, and form path."
- "What does this local proof validate?"
- "No. It is safe local-proof content for testing the second site before full production copy, images, and marketing claims are prepared."
- "No. The tenant template uses a placeholder API hash and requires a local environment variable at seed time."
- "Ready to test Roller Rink Rentals locally?"
- "Seed the roller tenant, set the local frontend env vars, then open the app through roller.localhost:3002."
- "Roller Rink Rentals local proof"
- "Test destination, retail, hospitality, and mixed-use venue copy without tying the proof to final production claims."
- "Roller Rink Rentals local proof content for portable roller rink planning, venue fit, event formats, and quote requests."
- "This local proof page keeps the content general while still exercising the CMS block renderer for the roller tenant."
- "These local-proof answers help validate page rendering before final production content is written."
- "No. This seed is designed for a local proof and should be rewritten with final brand, service, imagery, and conversion content before launch."
- "Ready to test a roller rink quote request?"
- "Open the contact page through roller.localhost:3002 and verify the submission is stored for the roller tenant."

## Source Fields Repaired

`contact`:

- `searchData.contentSummary`
- Contact block `subtitle`
- Contact block `hours`
- FAQ block `subtitle`
- FAQ question/answer copy
- CTA image alt copy
- Matching embedded `revision.latestSnapshot.page` copy

`home`:

- TrustBar item copy
- CardGrid subtitle and card description
- FAQ title, subtitle, questions, and answers
- PrimaryCTA title, description, and alt copy
- Matching embedded `revision.latestSnapshot.page` copy

`roller-rink-rentals`:

- `searchData.contentSummary`
- CardGrid subtitle and card description
- FAQ subtitle and answer copy
- PrimaryCTA title and description
- Matching embedded `revision.latestSnapshot.page` copy

## Replacement Copy Summary

The replacements keep the pages production-safe without inventing provider/company/state facts.

Examples:

- Test/proof form language became quote-review language.
- Local environment instructions became contact/quote workflow guidance.
- Placeholder routing/execution descriptions became non-secret public-routing statements.
- Local proof FAQ language became planning/process FAQ language.
- `roller.localhost:3002` references were removed from source.

The cleanup did not add real provider claims, real routing credentials, production pages, or email-sending behavior.

## Revision / Rebuild Behavior

Each repaired Roller page was saved through the tenant API update path.

Saved source results:

| Page | Phrase occurrences repaired | Final page version | Final revision number | `needsRebuild` |
| --- | ---: | ---: | ---: | --- |
| `contact` | 14 content + 3 metadata | 4 | 4 | `true` |
| `home` | 14 content + 3 metadata | 4 | 4 | `true` |
| `roller-rink-rentals` | 11 content + 3 metadata | 4 | 4 | `true` |

The second metadata cleanup pass removed local-proof wording from the repair notes themselves. The latest revision snapshot payloads were sanitized to avoid carrying stale local-proof copy forward into future static serialization.

## Validation

Post-repair API fetch scan:

- `contact`: 0 targeted bad phrase matches.
- `home`: 0 targeted bad phrase matches.
- `roller-rink-rentals`: 0 targeted bad phrase matches.

Targeted bad phrase scan included:

- `local proof`
- `local-proof`
- `local-dev`
- `localhost`
- `planning environment`
- `testing only`
- `test tenant`
- `test submission`
- `placeholder API`
- `Ready to test`
- `local frontend`
- `local environment`
- `contact proof`
- `proof questions`
- `generic local test`
- `local testing`
- `local-proof content`
- `local proof content`

Broad whole-word source scan notes:

- No remaining whole-word `test`, `proof`, `localhost`, `local proof`, or local-dev user-facing copy was found in the fetched CMS source records.
- Benign remaining terms are structural or acceptable:
  - `placeholder` appears as the form field property name `placeholder`.
  - "local gatherings" remains as normal event/service copy.
  - Internal routing labels such as `local_admin` remain non-secret metadata and were not changed.

Generated static output was not regenerated, so the existing `2026-05-22-1321` package still contains stale Roller copy and should not be used for final Roller content review.

## Staging Readiness

Updated decision:

- Ice technical staging readiness from Phase 7D is unchanged.
- Roller should be regenerated before staging content review, because the existing `2026-05-22-1321` Roller package is stale.
- After a fresh Phase 7F regeneration, Roller should be re-scanned for local-proof/local-dev/localhost terms before manual upload.

## Production Readiness

Production cutover should still wait.

Remaining expected blockers after Phase 7E:

- Fresh static packages must be regenerated from the repaired CMS source.
- Page-quality warnings should be re-counted after regeneration.
- Public pages still need manual workflow approval before production cutover.
- `staticPublishing.needsRebuild` should be resolved only through the final approved static build/publish workflow.

## Next Step

Run Phase 7F fresh static regeneration and validation:

- Regenerate Roller and Ice packages from CMS source.
- Confirm Roller generated output no longer contains local-proof/local-dev/localhost user-facing copy.
- Confirm page-quality warning counts remain at the expected manual approval/rebuild-only level.
- Keep production cutover blocked until the fresh package is clean and approved.

## Checks

Completed:

- `git diff --check`: passed.
- Direct trailing whitespace scan: passed.
- Protected config/workflow/generated-folder check: passed; no protected config or generated output folders are staged.
- Targeted secret scan: passed; matches were limited to safety wording and placeholder environment variable names in this report.
- Confirm generated static folders are not staged: passed.
- `node --check` for changed `.mjs` files: not applicable; no `.mjs` files were changed in Phase 7E.
