# Known Limitations

Phase 2F-5 adds restore validation dry-run planning only. It does not make the Backup Center production-ready.

## Still Not Implemented

- Real database exporter.
- Real database importer.
- Real CMS/API exporter.
- Real CMS/API restore adapter.
- Real MediaAsset export.
- Real MediaAsset restore.
- Real blob/media download.
- Real blob/media restore.
- Real static output export.
- Real static output restore.
- Encrypted secret escrow payload flow.
- Restore execution.
- Backup zip/package writer.
- Admin UI.
- API endpoints.
- Job queue/worker execution.
- Production retention policies.
- Operator approval workflow enforcement outside this local CLI.

## Validator Limits

- Secret detection is heuristic and must be treated as a safety net, not proof that all possible secrets are impossible.
- Schema checks are local contract checks, not a finalized production JSON Schema package.
- Failure fixtures are generated fake bundles, not production corruption samples.
- Restore validation is a dry-run planner only. It never writes a real restore target.
- Reports are local `.tmp` artifacts and must not be treated as a production audit log.

## Future Approval Required

The first real IceSkatingRinkRentals.com backup proof requires a separate preflight approval after restore validation and encrypted escrow are implemented and validated.
