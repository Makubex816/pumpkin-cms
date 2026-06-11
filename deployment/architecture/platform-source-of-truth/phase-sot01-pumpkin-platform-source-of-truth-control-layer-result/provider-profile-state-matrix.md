# Provider Profile State Matrix

| Provider/profile | State | Notes |
| --- | --- | --- |
| local/offline | Supported | Default safe profile |
| fake-provider | Supported | Fixtures and tests |
| local-file-backed | Supported | OLM local store |
| local-api-fake-provider | Supported | Admin/API read-only checks |
| staging-simulated | Supported | `.tmp` evidence only |
| live-readonly | Explicit only | No writes |
| live-write-approved | Future gated | Blocked until SOT, resource, contract, backup, registry, readback, and rollback gates pass |
| production-runtime | Closed for OLM staging write | Must not be activated casually |

Current OLM package provider mode is `staging-simulated`.

