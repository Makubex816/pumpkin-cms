# Web App Runtime Config Diagnosis

Safe runtime/config metadata was inspected. App settings were not listed, shown, or set.

Observed metadata:

| Field | Value |
| --- | --- |
| `linuxFxVersion` | `DOTNETCORE|10.0` |
| `appCommandLine` | empty |
| `alwaysOn` | `false` |
| `ftpsState` | `FtpsOnly` |
| `http20Enabled` | `false` |
| `minTlsVersion` | `1.2` |
| `numberOfWorkers` | `1` |
| `remoteDebuggingEnabled` | `false` |
| `webSocketsEnabled` | `false` |

Conclusion: the live HTTP `500` was not caused by an incorrect App Service runtime stack or app command line.
