# Risks and Open Decisions

| Item | Severity | Status | Recommendation |
| --- | --- | --- | --- |
| JSON Schema library not chosen | medium | open | Pick library before implementation. |
| Normalized statuses differ from existing schema enum | medium | open | Update schema under separate implementation approval or map internally. |
| Cross-file rules can drift from schemas | high | open | Treat cross-file validators as first-class tests. |
| URL safety false positives | medium | open | Maintain detector codes and allowlist policy. |
| URL safety false negatives | high | open | Include secret query fixtures and denylist tests. |
| `tenant.json.owners` overlaps `owner-contacts.json` | low-medium | open | Make `owner-contacts.json` canonical. |
| Deployment profile registry has no concrete profile JSON fixtures | medium | open | Add fixture before automation. |
| Deployment profile environment variables are not classified | high | open | Add public/secret/required/optional classification before accepting implementation. |
| Profile-specific smoke tests are not yet fixture-backed | medium | open | Add offline smoke fixtures for each supported deployment profile. |
| Extension permission and migration schemas may remain too loose | medium | open | Either validate extension manifests in Phase 2A or explicitly defer with a blocking follow-up. |
| Support packet export could accidentally include secrets | high | open | Redaction tests required. |
| Search Console readiness could be mistaken for approval | high | controlled | Keep final-gate language and status blocking. |
| Roller accidental inclusion | high | controlled | Add paused tenant fixture. |
