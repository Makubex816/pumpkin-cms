# PERF-10 capacity overlay

Record-only. No scale action was performed.

| Field | Value |
| --- | --- |
| Milestone | `PERF-10` |
| Current capacity | S2 / two workers |
| Decision | `temporary_observation` |
| Review window | 7 to 14 days |
| Automatic scale down | false |
| Automatic scale up | false |
| S1 retest | not approved |
| Higher capacity | not approved |
| Parallel status | runs in parallel with downstream work |

## Prior S1 observation

- TenantAdmin sequential login cycle 5.
- No response after 30.013 seconds.
- Not repeated.
- Returned to S2.

## A02 action

No App Service plan, worker count, slot, app, deployment, feature flag, or app setting was changed.
