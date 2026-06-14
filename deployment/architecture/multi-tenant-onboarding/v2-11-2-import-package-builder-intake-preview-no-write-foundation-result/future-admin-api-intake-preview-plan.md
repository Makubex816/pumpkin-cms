# Future Admin API Intake Preview Plan

Recommended next phase:

`V2.11.3 Admin/API Read-Only Import Intake Preview Contract Planning`

Plan:

- define a read-only Admin/API contract for listing package candidates;
- define a read-only contract for fetching intake previews;
- map CLI preview JSON to a shared DTO;
- define no-write API guards;
- define Admin viewer states for valid, paused/no-import, and invalid packages;
- define audit/logging fields without writing CMS/provider/import state;
- define runtime QA for read-only preview only.

The next phase should not execute imports or create mutation endpoints.
