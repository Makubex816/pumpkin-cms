# Production Record Mapping

The mapper converts local snake_case store records into provider-neutral production candidate records. The candidate shape is intentionally close to a future document-provider model, but remains a local JSON contract until a later staging or production approval.

## Common Fields

Every candidate record includes:

- `schemaVersion`
- `id`
- `targetRecordId`
- `sourceRecordId`
- `migrationRunId`
- `migrationRecordId`
- `tenantKey`
- `siteKey`
- `partitionKey`
- `targetEntity`
- `entityType`
- `sourceEntity`
- `sourceProvider`
- `providerMode`
- `targetProviderType`
- `targetContainer`
- `recordVersion`
- `dryRunOnly`
- `liveWriteAllowed`
- `createdAt`
- `updatedAt`
- `beforeStateHash`
- `afterStateHash`
- `migrationRecordHash`

## Entity Mapping

- `outbound_links`: URL, domain, lifecycle status, detection counts, disabled metadata.
- `outbound_link_instances`: target link reference, page/content location, anchor text, instance status.
- `outbound_link_policies`: active policy flag, allowed/blocked/review domains, default render behavior.
- `outbound_link_scan_runs`: local scan status and counts.
- `outbound_link_audit_logs`: local audit event details and correlation IDs.
- `outbound_link_render_decisions`: local rendered decisions or synthesized deterministic decisions.
- `outbound_link_review_decisions`: pending, disabled, or blocked link review preservation.
- `outbound_link_bulk_actions`: dry-run domain-scope summaries.
- `outbound_link_rollback_plans`: non-executable rollback intent for the candidate set.
- `outbound_link_trace_logs`: trace records tying source IDs, target IDs, hashes, audit IDs, rollback IDs, provider mode, actor-safe metadata, and outcome together.

## Provider Boundary

The profile can name target containers and a credential reference ID, but the mapper never resolves credential values. `dryRunOnly` is always `true` and `liveWriteAllowed` is always `false`.
