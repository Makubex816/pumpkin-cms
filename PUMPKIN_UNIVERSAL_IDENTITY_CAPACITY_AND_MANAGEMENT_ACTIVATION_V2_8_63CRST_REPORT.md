# Pumpkin universal identity capacity and management activation V2.8.63CRST

Final status: `blocked_three_corrected_slot_candidate_cycles_failed`.

CRSR carryforward closeout `fec340b158696db2ba78747007a57fe8fbbf01c0` and source `7a733d5f2812d8459716f7b9c2e76b5e6a3252b9` were verified before CRST work.

## Outcome

The owner-approved scale from S1/two workers to exactly S2/two workers completed at 2026-07-15T19:57:20Z. The plan remains S2/two workers, production remains healthy and unchanged on deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`, and the `crr-validation` slot is stopped with dual-write and diagnostics disabled. The initial 72-hour approval expires at 2026-07-18T19:54:40.8078855Z; an owner extension is required to retain S2 beyond that timestamp.

The ignored approval metadata SHA-256 is `836831e3cf950c5caa2c0b6d43f12f486c71439acfa62ef6c7e6c4186414f6e2`. The verified restricted backup passed 18/18 checksum entries. Pre-scale S1 observation windows averaged 8.58-14.68 percent CPU with a 72 percent peak, 65-69 percent memory with a 74 percent peak, and zero queue; the prior CRSR acceptance workload had reached 99 percent CPU and 86 percent memory.

## Source and immutable candidate

Clean source commits were `c354cfb6`, `dc1c225e`, `03211a7e`, `e65e76c1`, and `6d781337`; their branch equivalents were `b88c7825`, `36407cd3`, `51039ead`, `ac62862c`, and `2864c664`. The final strict Cosmos deadline repair built deterministically with zero Release warnings/errors and 39/39 focused identity source tests passing.

The final 11,957,894-byte package SHA-256 is `0eed05a93c21f1291a8d2d1e89c15ef7c7b00d6dca3d729f7987a17e9e7aae29`; slot deployment is `31667716-211b-473d-8027-e98e92d0e895`. It was the third and final materially corrected candidate.

Candidate one failed the direct-diagnostic authorization gate with HTTP 401/`identity_session_invalid` before endpoint execution; `e65e76c1` supplied the narrowly scoped diagnostic-token correction. Candidate two then passed the direct and warm stages but failed Stage A cold 17/18 with a 6,106 ms lookup, HTTP 503, zero BCrypt calls, and zero writes; `6d781337` applied strict cancellation to all three raw Cosmos reads. Candidate three failed overall production-parity readiness because its later pass could not prevent earlier routable 503s.

## Slot proof and hard gate

The zero-write Cosmos SQL diagnostic passed with a 255 ms legacy query. Stage A passed 18/18 warm and 18/18 cold on two workers, represented by safe affinity digests `6054646f6bafcc71` and `e58c6a3f7a0c1616`, with one BCrypt verification per logical login. Each schedule included five sequential cycles per role and the two-request moderate burst. Maximum Stage A lookup was 3,724 ms, BCrypt was 2,442 ms, per-request process CPU was 6,375.815 ms, pending work was two, and at least 32,764 worker threads remained available; capacity peaked at 73 percent CPU and 82 percent memory with zero queue.

Stage B warm acceptance passed 18/18 and produced exactly 16 audits and 16 sessions for 16 valid logins. Two retained first-data-path runs nevertheless each returned one HTTP 503 before BCrypt or writes, at 38.19 and 28.74 seconds after worker start. A final predeclared proof withheld identity traffic until 136.542 seconds after the later worker start and then passed 18/18 with 16 audits and sessions, including five sequential cycles per role and the two-request moderate burst. Its maximum lookup was 3,228 ms, BCrypt 1,748 ms, total server time 4,828 ms, per-request process CPU 5,690.705 ms, pending work three, and minimum available worker threads 32,764; capacity peaked at 78 percent CPU and 80 percent memory with zero queue.

That delayed pass did not cure the production-safety defect. Always On was off, no dependency-aware App Service health or warmup path was configured, and the existing health endpoint did not test the identity provider. Nothing could prevent production routing during the proven 28-38 second failure interval. All three material candidate cycles were consumed, so no fourth package was authorized and no promotion was attempted.

## Production and customer preservation

Production foundation and dual-read remain enabled; dual-write and all management, migration, rename, and notification flags remain disabled. Closeout health passed on both workers. SuperAdmin and TenantAdmin logins returned HTTP 200 in 1,212 ms and 768 ms. Four tenant identities, five UserAccounts, five TenantMemberships, four TenantContactSettings, and 12 FormEntries remained present, with nine dual-read comparisons and zero mismatch.

Customer passwords, login emails, roles, memberships, slugs, TenantAdmins, and contact settings were preserved. Vegas contact remains `klavier91@aol.com`; the Vegas TenantAdmin login remains `klavier91@proton.me`. Admin, starter preview, Ice, Party Pros, and Vegas runtime checks returned HTTP 200. No external customer email, Airstrip public-runtime request, indexing change, or secret exposure occurred.

## Held work and capacity recommendation

No immutable promotion, Admin deployment, seven-stage management activation, synthetic identity or cleanup, TenantAdmin transfer, password/session proof, provider delivery proof, or S1 retention test occurred. Final S2 observation after the slot stopped averaged 14.33 percent CPU and 70.92 percent memory, with observed maxima of 39 and 76 percent and zero queue.

Retain S2/two workers. The required next step is explicit owner approval for a fourth immutable candidate containing a truthful readiness endpoint that stays non-200 until process age is at least 90 seconds and a bounded zero-write identity/Cosmos probe succeeds, together with App Service startup and swap-warmup configuration that admits only HTTP 200. Do not begin V2.8.63D until that candidate passes complete slot and production acceptance and the held management stages complete.

Detailed result documents are under `deployment/architecture/identity/v2-8-63crst-capacity-identity-activation-result/`.
