# Admin Consumer Contract Mapping

Status: mapped; Admin adapter adoption remains next gate.

Current Admin V2.9.4/V2.9.5 provider fields map to V2.9.6 contract fields:

- `AUDIT_JOB_LEDGER_PROVIDER_MODE` -> `providerMode`
- local fixture path -> `source.fixturePath`
- `viewerModel.summary` -> `data.summary`
- `viewerModel.panels` -> `data.panels`
- `viewerModel.auditEvents` -> `data.auditEvents`
- `viewerModel.jobRuns` -> `data.jobRuns`
- `viewerModel.promotionGates` -> `data.promotionGates`
- `viewerModel.evidenceBindings` -> `data.evidenceBindings`
- `viewerModel.traceIds` -> `data.traceIds`
- disabled future actions -> validator rule `MUTATION_ACTION_NOT_DISABLED`

Next Admin work should replace duplicate provider transformation logic with the shared contract adapter or generated fixture consumption. It should also remediate the local Next runtime HTTP timeout before browser QA is considered signed off.
