# Local Job Ledger Schema

Result: complete.

This is a local no-write schema definition for future implementation. V2.9.1 did not add runtime integration or a source validator.

Record shape:

| Field | Required | Notes |
| --- | --- | --- |
| `schemaVersion` | yes | Start with `job-ledger.v1` |
| `jobRunId` | yes | Stable job ID |
| `jobType` | yes | Must be from `job-run-taxonomy.md` |
| `v2Reference` | yes | Current reference |
| `laneId` | yes | Product lane |
| `tenantKey` | yes | Tenant key |
| `siteKey` | yes | Site key |
| `startedAt` | yes | ISO timestamp or null for planned jobs |
| `completedAt` | no | ISO timestamp after completion |
| `status` | yes | `planned`, `running`, `passed`, `failed`, `blocked`, `deferred`, `cancelled` |
| `attemptCount` | yes | Integer, default `0` for planned |
| `retryCount` | yes | Integer, default `0` |
| `approvalReference` | yes | Approval or no-action boundary reference |
| `correlationId` | yes | Links job and audit events |
| `evidenceRefs` | yes | Safe paths or package refs |
| `mutationFlags` | yes | Explicit booleans for every restricted action |
| `resultSummary` | no | Non-secret summary |
| `blockers` | no | Array of safe blocker strings |

Required mutation flags:

- `deployment`
- `redeployment`
- `dnsChange`
- `customDomainMutation`
- `searchConsoleAction`
- `indexingRequest`
- `contactFormSubmission`
- `contactEndpointPost`
- `cmsWrite`
- `providerWrite`
- `azureMutation`
- `rbacAssignment`
- `protectedConfigRead`
- `tokenUseOrPrint`
- `keysListKeys`
- `connectionStringGenerated`
- `sasGenerated`
- `crawlOrOutboundCheck`

