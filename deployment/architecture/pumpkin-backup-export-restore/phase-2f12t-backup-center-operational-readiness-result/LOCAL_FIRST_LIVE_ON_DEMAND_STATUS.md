# Local-First Live-On-Demand Status

Status: preserved

Local-first guarantees retained:

- Backup Center and Resource Registry have local CLI workflows.
- Offline/fake fixtures remain part of validation.
- Standard backup validation and restore-plan validation can run locally.
- Generated proof artifacts live under ignored `.tmp` paths.
- Protected config values are not required for local checks.

Live-on-demand gates:

| Operation | Current status |
| --- | --- |
| Live Cosmos export | Proven in 12R, future reruns require explicit approval. |
| Live media download | Proven in 12S, future reruns require explicit approval. |
| Cosmos seed/write | Proven only under guarded 12Q approval; future writes require explicit approval. |
| CMS runtime switch | Not approved. |
| CMS writes | Not approved. |
| Deployment/indexing/live publication | Not approved. |

12T validation boundary:

The only validations run in 12T were local package checks:

- Backup Center `npm run check`: passed on rerun with 78 tests.
- Resource Registry `npm run check`: passed with 13 tests.

The first Backup Center check hit a transient escrow validator false positive (`ESCROW_PAYLOAD_PLAINTEXT`) in a fake-encryption test and passed on rerun. No live calls were involved.
