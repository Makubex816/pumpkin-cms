# Blockers And Open Decisions

## Hard Blockers

| Blocker | Exact state |
| --- | --- |
| Ice current safe local source | missing `service-areas`; obsolete `ice-rink-rentals` and `events-holiday-activations` are present |
| Ice static output validation | failed with missing route, obsolete route, static form endpoint, and raw preview-output issues |
| Contact form endpoint in current shell | not configured/verified for current safe static output validation |
| Production media URL readiness | not refreshed in V2.8.1 |
| Deployment/DNS/indexing/publication | not approved |

## Caveats

| Caveat | Handling |
| --- | --- |
| Next static build auto-detected `.env.local` | No protected config file was manually opened or printed; stop further Next build/serve commands until a sanitized build path is approved. |
| Historical CMS-backed static proof exists | Useful carry-forward, but not refreshed because V2.8.1 forbids protected config reads and live CMS/API reads. |
| Current-session OLM_STAGING env contract missing | Blocks new provider actions in this shell; does not undo V2.2 stage-ready evidence. |

## Open Decisions

- Whether V2.8.2 should refresh the safe local static source from approved non-secret artifacts or use an approved CMS snapshot generation path.
- Whether the next phase should create a sanitized build workspace that excludes `.env.local`.
- Whether to carry forward the 2026-06-06 static form endpoint proof or require a fresh endpoint verification under an approved non-secret contract.
- Whether Roller should remain paused or receive a separate local readiness lane.
