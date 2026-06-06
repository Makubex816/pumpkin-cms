# Remaining Indexing Blockers

Generated: 2026-06-06

## Technical Blockers

None remain from the approved cleanup scope.

| Previous blocker | Current result |
| --- | --- |
| hidden serialized CMS workflow/review payload in public HTML | cleared from deployable output and live production |
| `/contact` hidden indexing-not-authorized text | cleared from deployable output and live production |
| stale `draft`/`needs_review` workflow strings in hidden public payload | cleared from deployable output and live production |
| sitemap URLs omitted trailing slashes while canonicals included them | cleared; sitemap now matches canonical trailing slashes |

## Remaining Approval Gates

Search indexing actions still require separate approval:

- Search Console property/ownership verification if needed
- sitemap submission
- URL Inspection
- indexing request
- indexing monitoring/reporting actions

## Optional Future Decision

`www` continues to serve 200 with apex canonical tags rather than redirecting to apex. This was previously documented as a canonical-only behavior. It is not a blocker for the approved cleanup, but a future redirect rule would require separate approval.

## Classification

| Area | Result |
| --- | --- |
| production custom domain cutover | yes |
| production smoke test passed | yes |
| indexing cleanup completed | yes |
| static output indexing readiness | yes |
| live production indexing readiness | yes |
| Search Console submission readiness | yes, technically ready; explicit approval still required |
| deployment required before indexing submission | no |
| Roller | paused |
