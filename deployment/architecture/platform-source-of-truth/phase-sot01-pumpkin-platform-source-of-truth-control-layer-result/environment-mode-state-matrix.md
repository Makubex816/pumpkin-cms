# Environment Mode State Matrix

| Mode | Current permission | SOT-01 status |
| --- | --- | --- |
| local/offline | Allowed | Preserved |
| fake-provider | Allowed | Preserved |
| offline-bundle | Allowed | Preserved |
| local-file-backed | Allowed | Preserved |
| staging-simulated | Allowed for local evidence | Preserved |
| live-readonly | Explicit approval only | Indexed, not invoked |
| live-write-approved | Future explicit approval only | Blocked |
| production-runtime | Not allowed by current gate | Blocked |

SOT-01 did not inspect protected config or environment secret values.

