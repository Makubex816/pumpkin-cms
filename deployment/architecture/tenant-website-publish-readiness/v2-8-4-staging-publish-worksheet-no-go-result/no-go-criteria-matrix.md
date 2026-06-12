# No-Go Criteria Matrix

Any active no-go blocks staging publish execution.

| No-go condition | Current state | Action required |
| --- | --- | --- |
| Canonical route missing from source or output | passed by V2.8.3 and V2.8.4 lightweight validation | keep as preflight check |
| Static output validator fails | passed by V2.8.3 | rerun after sanitized build |
| Staging package validator fails | passed by V2.8.3 | rerun after sanitized build |
| Runtime QA fails or is stale | passed, `runtimeqa_e42c0a2c9da73a4a` | rerun before execution |
| OLM publish gate fails | passed, `liveWriteAllowed: false` | keep live writes blocked |
| Backup Center proof missing or stale | passed carryforward from 2F-14 | owner accepts carryforward or requests refresh |
| Resource Registry/provider profile stale | passed V2.8.4 | rerun before execution |
| Admin/API operator readiness stale | passed carryforward from V2.7.2 | rerun only if Admin/API changed materially |
| Contact form owner verification missing | active no-go | owner must approve endpoint behavior |
| Final media/content approval missing | active no-go | owner must approve final content/media state |
| Sanitized no-dotenv build pattern missing | active no-go | implement and validate no-dotenv build harness |
| Deployment target ambiguous | active no-go | exact staging target must be approved |
| DNS target ambiguous | active no-go | exact staging DNS record must be approved |
| Indexing target ambiguous | active no-go | keep indexing closed |
| Step requires protected config or secret export | active no-go by policy | stop and redesign |
| Step requires CMS/provider write | active no-go by policy | separate explicit approval required |

Current classification: staging publish execution is not approved.

