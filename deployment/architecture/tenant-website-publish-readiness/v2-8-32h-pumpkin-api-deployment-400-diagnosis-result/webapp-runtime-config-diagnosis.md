# Web App Runtime Config Diagnosis

Safe runtime/config metadata was inspected. App settings were not listed, shown, or changed.

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

Conclusion: no non-secret runtime stack correction was required in H. The selected Linux Web App already reported the expected `.NET 10` stack metadata.
