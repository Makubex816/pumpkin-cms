# Provider Selection Flow

## Flow

1. Load the requested tenant/site/environment tuple.
2. Resolve the active profile name from approved non-secret configuration.
3. Resolve provider metadata from the profile source.
4. Validate that the metadata response is redacted and contains no secret-bearing fields.
5. Classify the provider state.
6. Select an action based on state and approval gates.

## Profile Sources

| Profile | Provider Metadata Source |
| --- | --- |
| `local-dev` | Local fixture or fake resolver |
| `fake-provider` | Test fixture resolver |
| `live-readonly` | Approved GET-only provider metadata endpoint in a later execution |
| `runtime-cosmos-future` | Disabled runtime Cosmos profile plus local metadata |
| `production-write-approved` | Future approved runtime configuration |

## State Decisions

| Provider State | Decision |
| --- | --- |
| Missing provider metadata | Abort and return to provider discovery |
| Planned future provider | Keep runtime on current source; provisioning approval required |
| Provisioned future provider with runtime wiring required | Keep runtime on current source; proceed only to no-switch wiring implementation approval |
| Runtime configured but data not seeded | Keep live pages hard-stopped; require seed/migration preflight |
| Runtime configured and seeded | Require readback verification and backup proof before switch planning |
| Metadata contains secret material | Abort immediately |

## Ice Decision

Ice is in the provisioned future provider state. The next allowed step is a no-switch runtime profile implementation foundation. The CMS runtime source must remain unchanged.

