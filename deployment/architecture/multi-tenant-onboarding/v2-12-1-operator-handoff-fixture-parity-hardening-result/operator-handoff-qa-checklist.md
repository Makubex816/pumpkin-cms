# Operator Handoff QA Checklist

Before an operator consumes a handoff packet:

- Confirm `schemaVersion` is `pumpkin.operatorHandoffPacket.v1`.
- Confirm all 26 required fields are present.
- Confirm Ice package hash, approval manifest ID, execution run ID, target mode, readback counts, and entity mapping count match canonical V2.11 evidence.
- Confirm Roller has no approval manifest ID, no execution run ID, `blocked_no_import_no_resume` target mode, and no import/resume approval.
- Confirm Google/Search Console/indexing is deferred.
- Confirm OLM 2H-23A is a separate future carryforward only.
- Confirm no protected config references or secret-like values are present.
- Confirm no compressed archive request is present.
- Confirm all security boundary write/deploy/indexing/Azure flags are false.
- Confirm future Admin/API/Electron consumers remain read-only and separately approved.
