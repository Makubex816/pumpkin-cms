# Capacity scale, slot, and login acceptance

## Approval, backup, and scale

The ignored S2/two-worker approval file was validated at `.tmp/v2-8-63crst/owner-input/pumpkin-api-s2-two-worker-capacity-approval.json`; its SHA-256 is `836831e3cf950c5caa2c0b6d43f12f486c71439acfa62ef6c7e6c4186414f6e2`. The restricted pre-scale backup passed all 18 checksum entries and preserved four tenant identities, five UserAccounts, five TenantMemberships, four TenantContactSettings, and the existing form data.

The approval was issued at 2026-07-15T19:54:40.8078855Z and its initial 72-hour window expires at 2026-07-18T19:54:40.8078855Z. Continuing S2/two workers beyond that timestamp requires an owner extension.

The plan scaled from S1/two workers to exactly S2/two workers at 2026-07-15T19:57:17Z and converged at 2026-07-15T19:57:20Z. No higher SKU, extra worker, second paid plan, or autoscale rule was used. Pre-scale observation windows averaged 8.58-14.68 percent CPU with a 72 percent observed peak, 65-69 percent memory with a 74 percent observed peak, and zero HTTP queue. The CRSR carryforward workload had previously reached 99 percent CPU and 86 percent memory on S1.

## Candidate ledger

Three materially corrected slot candidates were consumed:

1. The production-parity identity runtime correction from clean source `c354cfb6` (package source tree `dc1c225e`) deployed as `05724e1d-6724-47b6-8f54-0f0595a8375d`. It failed the zero-write direct-diagnostic authorization gate at 2026-07-15T23:04:21Z: HTTP 401 after 4,982 ms with `identity_session_invalid`, before the endpoint executed. Material correction `e65e76c1` added narrowly scoped compatibility for the exact existing production SuperAdmin token shape only on the gated diagnostic route.
2. The scoped diagnostic-token parity correction at `e65e76c1` deployed as `aa215fb2-146c-4fc7-ae7a-a472f09f8ec2`. It passed the direct diagnostic and Stage A warm 18/18, then failed Stage A cold 17/18. The first invalid login on worker digest `6054646f6bafcc71` returned HTTP 503 in 6,774 ms client/6,166 ms server, with a 6,106 ms legacy lookup, zero BCrypt calls, zero writes, and `TimeoutException`. Material correction `6d781337` applied the strict cancellation deadline to all three raw Cosmos reads.
3. The strict Cosmos provider-read deadline correction at `6d781337` deployed as `31667716-211b-473d-8027-e98e92d0e895`. It failed overall production-parity readiness because the same artifact produced routable first-touch 503s at 38.19 and 28.74 seconds without an enforceable dependency gate; correcting this requires an unauthorized fourth material candidate.

Deployment `8abe45bb-e2b9-479b-852f-3f53fa44a9ba` carried only the interrupted-login reconciliation tool/package update from `03211a7e`; it was audited as non-material to the slot runtime and did not consume a candidate cycle.

The final artifact was independently published twice with the same 55-file shape. It is 11,957,894 bytes with SHA-256 `0eed05a93c21f1291a8d2d1e89c15ef7c7b00d6dca3d729f7987a17e9e7aae29`.

## Direct provider proof

The final candidate's zero-write diagnostic returned HTTP 200 through Cosmos SQL using the configured connection-string/account-key path. Server time was 514 ms: DNS 43 ms, TCP 34 ms, TLS 74 ms, database metadata 53 ms, container metadata 51 ms, and legacy query 255 ms. Identity counts and pending reconciliation state were unchanged before and after the diagnostic. A later explicit zero-write warmup reached both workers with 63 ms and 68 ms legacy queries.

## Stage A, dual-write disabled

Stage A passed on both workers, represented in safe evidence by affinity digests `6054646f6bafcc71` and `e58c6a3f7a0c1616`:

- Warm schedule: 18/18 HTTP outcomes passed, including the per-worker invalid/valid proof, five sequential cycles for each approved role, and the two-request moderate burst. Maximum server total was 5,238 ms, legacy lookup 3,603 ms, BCrypt 1,971 ms, and per-request process CPU 5,922.234 ms. Thread-pool pending work remained at zero and at least 32,765 worker threads were available. Each logical login made one BCrypt verification.
- Cold schedule: 18/18 HTTP outcomes passed after approximately 80 seconds of post-start age, including five sequential cycles for each role and the two-request moderate burst. Maximum server total was 6,179 ms, legacy lookup 3,724 ms, BCrypt 2,442 ms, and per-request process CPU 6,375.815 ms. Maximum thread-pool pending work was two and at least 32,764 worker threads were available. Each logical login made one BCrypt verification.
- The exact proof-ID acceptance window contained the expected two identity readbacks and zero login audits and sessions.
- Across the Stage A capacity window, CPU averaged 21.79 percent with a 73 percent observed maximum, memory averaged 76.93 percent with an 82 percent observed maximum, and HTTP queue remained zero.

## Stage B, dual-write enabled in the slot

The first Stage B touch at 38.19 seconds after worker start was a retained non-pass: 17/18 outcomes were correct and one invalid login returned HTTP 503 before BCrypt or any write. After the zero-write provider warmup, the official warm rerun passed 18/18, including five sequential cycles for each role and the two-request moderate burst. Its maximum server total was 1,063 ms, lookup 106 ms, BCrypt 639 ms, legacy accounting 41 ms, identity write 235 ms, session write 131 ms, audit write 66 ms, and per-request process CPU 1,453.155 ms. Thread-pool pending work remained at zero and at least 32,765 worker threads were available. The 16 valid requests produced exactly 16 legacy accounting writes, 16 identity writes, 16 sessions, and 16 audits.

A dedicated cold run made its first identity request 28.74 seconds after the later fresh worker start. Again, 17/18 outcomes were correct and one invalid login returned HTTP 503 before BCrypt or any write. This non-pass is preserved; it was not erased by a retry.

One final, predeclared same-package proof withheld identity traffic for at least 90 seconds. Its first identity request was 136.542 seconds after the later worker start and all 18/18 requests passed on both workers, including five sequential cycles for each role and the two-request moderate burst. The 16 valid requests produced exactly 16 accounting writes, identity writes, sessions, and audits. Maximum server total was 4,828 ms, lookup 3,228 ms, BCrypt 1,748 ms, identity write 742 ms, session write 1,212 ms, audit write 88 ms, and per-request process CPU 5,690.705 ms. Maximum thread-pool pending work was three and at least 32,764 worker threads were available. CPU averaged 25.93 percent with a 78 percent observed maximum, memory averaged 75.29 percent with an 80 percent observed maximum, and HTTP queue remained zero.

## Acceptance decision

The delayed proof demonstrates a usable readiness condition, not a promotable package. Always On was disabled, no App Service health-check path or warmup path was configured, and the ordinary health endpoint did not probe the identity/Cosmos dependency. App Service could therefore route a login during the proven 28-38 second failure interval. Because the task forbids promotion of an intermittently successful candidate and all three corrected candidate cycles are consumed, the final status is `blocked_three_corrected_slot_candidate_cycles_failed`.

At closeout the slot was stopped and returned to foundation/dual-read on, dual-write off, diagnostics off, and all management, migration, rename, and external-notification flags off. The plan remains S2 with two workers.
