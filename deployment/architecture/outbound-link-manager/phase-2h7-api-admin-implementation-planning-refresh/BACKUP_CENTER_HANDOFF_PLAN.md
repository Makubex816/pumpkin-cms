# Backup Center Handoff Plan

Outbound Link Manager state must remain Backup Center-compatible.

## Required Backup Files

Future standard backup bundles should include:

- `cms-content/outbound-links.json`
- `cms-content/outbound-link-instances.json`
- `cms-content/outbound-link-policies.json`
- `cms-content/outbound-link-scan-runs.json`
- `cms-content/outbound-link-audit-summary.json`
- `cms-content/outbound-link-render-decisions.json`
- `cms-content/outbound-link-validation-report.json`
- `cms-content/OUTBOUND_LINK_VALIDATION_REPORT.md`

## API/Admin Handoff Requirements

- Admin must show whether OLM state is included in the latest backup candidate.
- API exports must use the same schemas as local Backup Center exports.
- Restore validation must confirm status, policy, render decision, stale instance, and pending review counts.
- Restore plans must preserve disabled link and disabled instance governance state.
- Live-write approval should require a recent backup candidate or documented exception.

## Ownership

Backup Center remains the safety layer. Outbound Link Manager must extend the existing standard backup contract instead of inventing a parallel backup path.

