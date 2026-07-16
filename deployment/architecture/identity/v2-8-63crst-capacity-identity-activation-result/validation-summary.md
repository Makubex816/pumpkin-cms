# Validation summary

Final status: `blocked_three_corrected_slot_candidate_cycles_failed`.

- CRSR carryforward closeout `fec340b158696db2ba78747007a57fe8fbbf01c0` and source `7a733d5f2812d8459716f7b9c2e76b5e6a3252b9`: verified.
- Capacity approval, ignored-file boundary, verified backup, exact S2 scale, and two-worker cap: passed.
- Release API build: passed with zero warnings and zero errors.
- Focused identity source tests: 39/39 passed.
- Deterministic final API publish and package safety: passed; both publishes produced SHA-256 `0eed05a93c21f1291a8d2d1e89c15ef7c7b00d6dca3d729f7987a17e9e7aae29`.
- Final direct Cosmos diagnostic: passed with zero writes and a 255 ms legacy query.
- Slot Stage A warm and cold schedules: passed 18/18 on two workers with one BCrypt call per logical login; each included five sequential cycles per role and a two-request moderate burst. Maximum pending work was two and minimum available worker threads was 32,764.
- Slot Stage B official warm and stabilized cold schedules: passed 18/18 with exactly 16 audits and 16 sessions in each; each included five sequential cycles per role and a two-request moderate burst. Maximum pending work was three and minimum available worker threads was 32,764.
- Slot Stage B first-data-path acceptance: failed twice, at 38.19 and 28.74 seconds post-start, with HTTP 503 before BCrypt or writes.
- Prospective 90-second readiness policy proof: passed 18/18 when first identity traffic began at 136.542 seconds, but no deployed App Service readiness control could enforce that policy.
- Material candidate budget: three of three consumed; no fourth candidate was deployed.
- Immutable production promotion: not attempted.
- Production rollback deployment, health, approved logins, identity counts, dual-read comparison, Forms inbox, and tenant runtime: passed and unchanged.
- Admin deployment, seven management stages, synthetic proof/cleanup, and controlled S1 retention test: not attempted because their prerequisite gate failed.
- Tenant rename, Airstrip public-runtime request, external delivery, and indexing change: none.
- Slot cleanup: passed; slot stopped with dual-write and diagnostics disabled.
- Result manifest JSON parsing, repository whitespace validation, documentation secret/local-path scans, and the approved-email allowlist scan: passed; staged files remained zero.
