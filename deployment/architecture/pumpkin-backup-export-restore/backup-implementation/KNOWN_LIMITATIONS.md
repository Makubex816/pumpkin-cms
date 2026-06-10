# Known Limitations

Phase 2F-13 adds a unified local/live-readonly Backup Generator workflow, operator product files, Resource Registry reference inclusion, and optional `.tmp` ZIP packaging. It does not make the Backup Center a deployed production service or approve CMS runtime cutover.

## Still Not Implemented

- Real provider-source resolver execution against live runtime data.
- Runtime-configured CMS provider metadata endpoint backed by live configuration.
- Real Cosmos platform backup evidence collection.
- Real database importer.
- Real CMS/API exporter.
- Real CMS/API restore adapter.
- Real MediaAsset export.
- Real MediaAsset restore.
- Real blob/media restore.
- Real static output export.
- Real static output restore.
- Production encrypted escrow payload flow.
- Production key-management model.
- Production escrow recipient identity verification.
- Restore execution.
- Backup zip/package writer.
- Admin UI.
- Backup Center job API endpoints.
- Job queue/worker execution.
- Production retention policies.
- Deployed Backup Center job orchestration.
- Operator approval workflow enforcement outside this local CLI.
- Durable artifact storage outside owner-approved local `.tmp` handling.

## Validator Limits

- Secret detection is heuristic and must be treated as a safety net, not proof that all possible secrets are impossible.
- Schema checks are local contract checks, not a finalized production JSON Schema package.
- Failure fixtures are generated fake bundles, not production corruption samples.
- Restore validation is a dry-run planner only. It never writes a real restore target.
- Escrow encryption uses fake fixture values and runtime test keys only.
- Private keys are generated in memory for local round-trip validation and are not written.
- Reports are local `.tmp` artifacts and must not be treated as a production audit log.
- Fake media copies are text fixtures only, not real media files.
- Fake Cosmos records are local fixtures only, not exported production documents.
- Optional generator ZIP files are local convenience packages, not durable escrow or production retention.
- Provider resolver records still use local fixtures for Backup Center tests.
- Runtime profile records still use local fixtures for Backup Center tests.
- The CMS provider metadata endpoint foundation returns a static non-secret Ice future-target profile only.
- The endpoint does not prove CMS runtime is using Cosmos.
- `production-write-approved` is present as a future profile name, but it is hard-stopped in this phase.

## Future Approval Required

The next IceSkatingRinkRentals.com step is Backup Generator QA and owner signoff. It must remain validation/signoff only until separate approvals exist for any runtime switch, restore execution, Admin integration, Electron packaging, Outbound Link Manager execution, or live publication.
