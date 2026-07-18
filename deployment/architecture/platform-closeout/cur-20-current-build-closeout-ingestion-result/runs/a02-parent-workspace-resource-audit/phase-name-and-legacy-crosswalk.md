# Phase name and legacy crosswalk

No historical file, folder, commit, or report was renamed.

## Existing milestone names preserved

| Milestone | Meaning |
| --- | --- |
| `CUR-20` | Current Build Closeout Ingestion |
| `DISC-00` | Discovery baseline |
| `DISC-10` | Discovery continuation |
| `UP-20` | Recheck and Freeze Exact Upstream Source |
| `UP-30` | Upstream integration planning/qualification |
| `INT-10` | Integration readiness |
| `CAP-20` | CAPTCHA program |
| `VE-20` | Visual editor program |
| `FORM-20` | Forms/FormEntry program |
| `TEN-10` | Tenant onboarding |
| `CHAT-10` | Chat/working-memory continuity |
| `PAY-00` | Authorize.Net/payment gate |

## Identity milestones added to the crosswalk

| Milestone | Name | Legacy linkage |
| --- | --- | --- |
| `IDM-10` | Universal Identity Foundation | V2.8 identity foundation lineage |
| `IDM-20` | Production Identity Backfill and Compatibility | V2.8.63 backfill lineage |
| `IDM-30` | Identity Management Production Activation | attempts `IDM-30-A01`, `IDM-30-A02` |
| `IDM-40` | Mutable Tenant Slug Activation | retained downstream continuation |
| `IDM-50` | Identity and Tenant Administration Final Closeout | post-IDM-40 closeout |
| `PERF-10` | S2 Capacity Observation and Optimization Decision | parallel observation lane |

## Current legacy mapping

| Legacy phase ID | New milestone mapping | Status |
| --- | --- | --- |
| `V2.8.63CRR` | `IDM-30-A01` lineage | historical recovery attempt |
| `V2.8.63CRS` | `IDM-30-A02` lineage | slot/data-plane recovery attempt |
| `V2.8.63CRST` | `IDM-30` + `PERF-10` overlay | capacity/identity activation |
| `V2.8.63CRSTU` | `IDM-30` readiness gate | dependency-aware readiness |
| `V2.8.63CRSTUR` | `IDM-30` closeout / `IDM-40` next | complete; carried into CUR-20 docs only |
