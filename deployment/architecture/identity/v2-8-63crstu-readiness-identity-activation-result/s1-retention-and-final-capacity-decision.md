# S1 retention and final capacity decision

Final capacity decision: `retain_s2_two_workers_with_evidence`.

The controlled S1/two-worker test ran only after management Stages 2-7 completed, synthetic cleanup passed, customer preservation passed, no active slot swap existed, and the rollback slot was preserved.

S1 exposure:

- Scale to S1/two workers returned at `2026-07-16T13:56:47.7856714Z`.
- Recovery scale back to S2/two workers returned at `2026-07-16T13:58:13.7486907Z`.
- S1 observed two-worker readiness passed.
- Invalid login returned 401.
- SuperAdmin and TenantAdmin initial logins returned 200.
- Five sequential SuperAdmin cycles passed.
- TenantAdmin cycles 1-4 passed.
- TenantAdmin cycle 5 returned no HTTP response after 30.013 seconds.

That timeout fails the S1 retention criteria: zero timeouts and login below ten seconds. Per the prompt, the S1 test was not repeated.

S1 metrics during the failed window were not the deciding failure, but were recorded:

- Max CPU minute average: 10%
- Max memory minute average: 72.5%
- HTTP queue length: 0

S2 recovery:

- Final plan: S2 / two workers
- Final runtime smoke: passed
- API health/readiness: 200 / 200
- SuperAdmin login: 1.498 seconds
- TenantAdmin login: 1.452 seconds
- Cross-tenant denials: 6
- No-write lead preflights: 2
- Public/current-tenant GETs: 21/21
- Form entries unchanged: true
- S2 recovery max CPU minute average: 61%
- S2 recovery max memory minute average: 56.67%
- HTTP queue length: 0

Capacity diagnostics were disabled after metric capture and final feature-state proof confirmed both workers read `capacityDiagnosticsEnabled=false`.

Evidence:

- `.tmp/v2-8-63crstu/evidence/s1-two-worker-retention-test-attempt-2`
- `.tmp/v2-8-63crstu/evidence/final-capacity-decision/final-capacity-decision.json`
- `.tmp/v2-8-63crstu/evidence/final-runtime-smoke-after-capacity-diagnostics-disabled`
- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane/two-worker-feature-state-after-capacity-diagnostics-disabled.json`
