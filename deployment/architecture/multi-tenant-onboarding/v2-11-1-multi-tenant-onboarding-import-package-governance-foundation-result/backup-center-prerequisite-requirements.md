# Backup Center Prerequisite Requirements

Backup Center evidence is required before future import execution can be considered.

Required refs:

- backup/evidence package ID or artifact ref;
- rollback/abort plan ref;
- owner/operator approval ref;
- validation ref;
- restore-readiness note.

No-go conditions:

- missing backup evidence;
- rollback plan missing;
- restore owner missing;
- secret-bearing backup reference;
- request to upload/read/mutate storage without explicit approval.

V2.11.1 only validates references.
