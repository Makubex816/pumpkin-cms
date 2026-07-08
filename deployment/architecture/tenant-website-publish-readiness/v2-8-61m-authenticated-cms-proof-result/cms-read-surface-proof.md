# CMS Read Surface Proof

Status: passed.

Source-supported CMS read surfaces verified for the Ice tenant:

- Pages list/read: HTTP 200, count 3, detail readback HTTP 200.
- Themes list/read: HTTP 200, count 1, detail readback HTTP 200.
- Active theme read: HTTP 200, count 1.
- MediaAsset list/read: HTTP 200, count 9, detail readback HTTP 200.
- FormDefinitions list/read: HTTP 200, count 1, detail readback HTTP 200.
- FormEntries legacy list/read: HTTP 200, count 5, detail readback HTTP 200.
- FormEntries forms list/read: HTTP 200, count 5, detail readback HTTP 200.
- PublishRuns list/read: HTTP 200, count 1, detail readback HTTP 200.
- ImportRuns list/read: HTTP 200, count 1, detail readback HTTP 200.

Source-discovered write-capable CMS routes were deliberately not used:

- Page create/update/delete/import/rollback.
- FormEntry status patch.
- FormDefinition create/update/delete.
- Theme create/update/delete.
- MediaAsset create/upload/update/archive/restore/replace/delete.
- PublishRun and ImportRun creation.
