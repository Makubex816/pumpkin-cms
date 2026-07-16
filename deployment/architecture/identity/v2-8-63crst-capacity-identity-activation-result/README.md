# V2.8.63CRST capacity and identity activation result

Final status: `blocked_three_corrected_slot_candidate_cycles_failed`.

The approved App Service plan scale to S2 with two workers completed and remains in place. The exact final slot artifact passed Stage A with dual-write disabled and passed the warmed Stage B workload. It also passed all 18 requests, including 16 valid logins with 16 audits and 16 sessions, after a controlled 136.542-second post-start delay. Promotion is nevertheless prohibited: the same package returned first-data-path HTTP 503 responses when exercised 38.19 and 28.74 seconds after App Service had declared fresh workers started, and the deployed app has no enforceable readiness gate that withholds traffic until its identity dependency is ready.

The S2 approval was issued at 2026-07-15T19:54:40.8078855Z and its initial 72-hour window expires at 2026-07-18T19:54:40.8078855Z. S2/two workers is the safe closeout capacity, but retaining it beyond that timestamp requires an owner extension; the recommendation is not an indefinite cost authorization.

All three allowed materially corrected slot candidate cycles are consumed. Production was not swapped and remains on its known-good deployment with identity foundation and dual-read enabled and dual-write disabled. The validation slot is stopped with diagnostics and dual-write disabled. No Admin deployment, identity-management activation, synthetic identity, S1 retention test, tenant rename, Airstrip public-runtime request, or indexing change occurred.

The next action is not V2.8.63D. It requires explicit owner approval for a fourth packaged candidate that supplies a truthful identity-readiness endpoint and configures App Service startup and swap warmup to route only after that endpoint returns HTTP 200.

Repository documents contain metadata only. Raw logs, backups, credentials, packages, and operator evidence remain outside version control.
