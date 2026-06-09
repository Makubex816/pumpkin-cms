# Known Limitations

Phase 2F-12I adds a non-secret provider metadata endpoint foundation and local runtime profile bridge on top of the fake/local provider resolver foundation. It does not make the Backup Center production-ready or prove IceSkatingRinkRentals.com is fully backupable today.

## Still Not Implemented

- Real Cosmos read-only discovery.
- Real provider-source resolver execution against live runtime data.
- Runtime-configured CMS provider metadata endpoint backed by live configuration.
- Real Cosmos platform backup evidence collection.
- Real Cosmos portable JSON exporter.
- Real database importer.
- Real CMS/API exporter.
- Real CMS/API restore adapter.
- Real MediaAsset export.
- Real MediaAsset restore.
- Real blob/media listing.
- Real blob/media download.
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
- Operator approval workflow enforcement outside this local CLI.

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
- Provider resolver records still use local fixtures for Backup Center tests.
- The CMS provider metadata endpoint returns a static non-secret Ice future-target profile only.
- The endpoint does not prove CMS runtime is using Cosmos.

## Future Approval Required

The next IceSkatingRinkRentals.com step is runtime profile wiring preflight. It must remain no-mutation until a separate runtime wiring execution approval exists.
