# Runtime QA Staging Binding Result

No live Runtime QA staging evidence storage binding is active after V2.3.2.

Candidate diagnostics/evidence binding:

| Field | Candidate value | Status |
| --- | --- | --- |
| Runtime QA evidence container | `runtime-qa-staging` | not created |
| Log Analytics workspace | `log-pumpkincms-stg-olm01` | not created |
| Application Insights | `appi-pumpkincms-stg-olm01` | not created |

Runtime QA remains local/offline and fake-provider capable. A future staging resource creation phase must preserve the no-uncontrolled-write guard and must not require protected config or live writes for local validation.

