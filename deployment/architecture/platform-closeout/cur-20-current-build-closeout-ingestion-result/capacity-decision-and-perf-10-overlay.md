# Capacity decision and PERF-10 overlay

CUR-20 records the owner capacity decision without changing capacity.

Current verified capacity:

- Plan: `asp-pumpkin-api-prod-centralus-001`
- SKU: S2
- Worker count: 2
- Decision state: `temporary_observation`
- Observation window: approximately one to two weeks
- Review window minimum days: 7
- Review window maximum days: 14
- Automatic scale-down: false
- Automatic scale-up: false
- S1 retest approved: false
- Higher capacity approved: false

Observation start is carried from the CRSTUR closeout sequence. CRSTUR closed at `2026-07-16T14:08:03Z`; management activation completed at `2026-07-16T13:47:40.1475740Z`; final identity preservation readback occurred at `2026-07-16T14:07:13.4956019Z`.

S1 test carryforward:

- S1 / two workers was attempted exactly once.
- TenantAdmin sequential login cycle 5 returned no HTTP response after 30.013 seconds.
- The test was not repeated.
- The plan was returned to S2 / two workers.
- S2 recovery health/readiness passed.

PERF-10 is a parallel operational milestone. It must not replace, block, or silently outrank the primary upstream-integration and downstream-continuation path.

Optimization questions retained:

- whether the staging slot should remain stopped outside deployments;
- normal-load versus validation-load utilization;
- BCrypt scheduling and worker behavior;
- Cosmos client warmup and readiness;
- reserved-capacity or savings-plan options;
- whether lower capacity can ever satisfy the same acceptance contract;
- actual Azure invoice/cost evidence;
- operational value of keeping a staging slot.

No capacity action occurs in CUR-20.

