# Runtime QA Staging Binding Result

Runtime QA now has created staging diagnostics/evidence resources.

| Binding | Value | Status |
| --- | --- | --- |
| Runtime QA evidence container | `runtime-qa-staging` | created |
| Log Analytics workspace | `log-pumpkincms-stg-olm01` | created |
| Application Insights component | `appi-pumpkincms-stg-olm01` | created |

Runtime QA remains local/offline and fake-provider capable. Future phases must preserve the no-uncontrolled-write guard and must not require protected config or live writes for local validation.

