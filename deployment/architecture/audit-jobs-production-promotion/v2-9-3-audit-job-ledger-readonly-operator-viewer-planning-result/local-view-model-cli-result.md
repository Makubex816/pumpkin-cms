# Local View Model CLI Result

Command:

```powershell
npm run viewer-summary:combined
```

Working directory:

`deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation`

Result: passed.

## Output Summary

- `ok`: `true`
- `viewerModel.viewerModelVersion`: `audit-job-ledger-viewer.v1`
- `viewerModel.summary.status`: `read_only`
- `viewerModel.summary.releaseState`: `complete`
- `viewerModel.summary.indexingState`: `deferred`
- `viewerModel.summary.boundaryState`: `read_only`
- `viewerModel.summary.counts.auditEvents`: 11
- `viewerModel.summary.counts.jobRuns`: 9
- `viewerModel.summary.counts.promotionGates`: 11
- `viewerModel.summary.counts.evidenceBindings`: 13
- `viewerModel.summary.counts.traceEntries`: 107
- `viewerModel.summary.counts.warnings`: 1
- `viewerModel.summary.counts.blockers`: 0
- `viewerModel.summary.counts.nextGates`: 2

The command reads one local fixture and writes no files.
