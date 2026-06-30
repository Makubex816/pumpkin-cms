# Metric Activity Dependency Result

Metric window: 30 days.

Function App metrics:

| Metric | Total | Non-zero daily points | Interpretation |
| --- | ---: | ---: | --- |
| `Requests` | 209 | 12 | recent traffic present |
| `FunctionExecutionCount` | 79 | 3 | recent function executions present |
| `FunctionExecutionUnits` | 3293696 | 3 | recent function execution resource usage present |
| `Http2xx` | 147 | 12 | successful HTTP traffic present |
| `Http3xx` | 0 | 0 | no redirect traffic |
| `Http4xx` | 60 | 6 | client-error traffic present |
| `Http5xx` | 2 | 1 | server-error traffic present |

Storage account metrics:

| Metric | Total | Non-zero daily points | Interpretation |
| --- | ---: | ---: | --- |
| `Transactions` | 32217 | 25 | recent storage activity present |
| `Ingress` | 9848863 | 25 | recent storage ingress present |
| `Egress` | 11132805 | 25 | recent storage egress present |
| `SuccessE2ELatency` | 206136 | 25 | recent metric activity present |
| `Availability` | 3222600 | 25 | recent metric activity present |

Activity Log:

- 30-day resource group activity events: 0.
- 30-day write/action-like activity events: 0.

Decision impact: decommission blocked because Function App metrics show recent requests/executions.
