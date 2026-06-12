# Tenant Site State Matrix

| Tenant/site | Domain | Local content source | Current state | Publish readiness |
| --- | --- | --- | --- | --- |
| `ice-rink-rentals` | `iceskatingrinkrentals.com` | `seed-sites` current safe local source | active proof tenant | blocked: route shape stale and production gates closed |
| `ice-rink-rentals` | `iceskatingrinkrentals.com` | historical CMS snapshot/export proof | historical proof only | passed on 2026-06-06, but not refreshed under V2.8.1 scope |
| `roller-rink-rentals` | `rollerrinkrentals.com` | `seed-sites` current safe local source | paused proof tenant | not publish-ready; keep paused |

State rules:

- Ice remains the only active proof tenant for V2.8.1.
- Roller remains paused unless a future prompt explicitly resumes it.
- Historical generated `.static-content-snapshots`, `.static-artifacts`, `.next`, `out`, and `.static-release-dry-runs` are not canonical publish sources for this phase.
