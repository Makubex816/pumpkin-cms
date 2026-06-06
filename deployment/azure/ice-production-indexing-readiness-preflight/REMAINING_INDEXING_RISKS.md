# Remaining Indexing Risks

Generated: 2026-06-06

## Risks

| Risk | Severity | Detail | Recommendation |
| --- | --- | --- | --- |
| hidden serialized CMS review metadata | medium | production HTML contains `draft` and repeated `needs_review` strings | clean stale CMS workflow/review fields from static payload or explicitly accept before submission |
| `/contact` hidden indexing disclaimer | high | production HTML contains `Static generation and production indexing are not authorized` inside serialized payload | clean or explicitly accept before Search Console submission |
| sitemap/canonical slash mismatch | low-medium | sitemap lists approved URLs without trailing slashes; canonicals for `/contact` and `/service-areas` include trailing slashes | align sitemap URLs with canonicals or explicitly accept |
| `www` canonical-only behavior | low | `www` serves 200 and canonicalizes to apex instead of redirecting | acceptable if canonical-only is intended; otherwise future redirect approval needed |
| Search Console ownership state unknown | unknown | not checked in this preflight | verify under separate approval |

## Non-Risks Confirmed

| Area | Result |
| --- | --- |
| noindex | absent |
| robots global disallow | absent |
| staging/default host references in sitemap/robots | absent |
| localhost references | absent |
| obsolete/preview checked routes | 404 |
| media | production host and 200 responses |
| secrets | no high-confidence secret-like strings found in checked production HTML |

## Readiness Decision

Do not submit to Search Console until the owner either approves the current risks or authorizes cleanup.
