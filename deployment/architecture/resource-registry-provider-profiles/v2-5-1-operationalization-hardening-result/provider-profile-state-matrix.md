# Provider Profile State Matrix

| Provider profile | Mode | Environment | State |
| --- | --- | --- | --- |
| `provider-profile-local-dev` | `local-dev` | local | allowed |
| `provider-profile-fake-provider` | `fake-provider` | local | allowed |
| `provider-profile-offline-bundle` | `offline-bundle` | local | allowed |
| `provider-profile-local-file-backed` | `local-file-backed` | local | allowed |
| `provider-profile-local-api-fake-provider` | `local-api-fake-provider` | local | allowed-readonly |
| `provider-profile-staging-simulated` | `staging-simulated` | staging-simulated | allowed |
| `provider-profile-live-readonly` | `live-readonly` | staging | allowed-readonly |
| `olm-staging-cosmos-nosql-v1` | `live-write-approved` | staging | scoped-only |
| `provider-profile-production-runtime-blocked` | `production-runtime` | production | blocked |

The validator requires all nine canonical modes to be represented and prevents global provider activation.

