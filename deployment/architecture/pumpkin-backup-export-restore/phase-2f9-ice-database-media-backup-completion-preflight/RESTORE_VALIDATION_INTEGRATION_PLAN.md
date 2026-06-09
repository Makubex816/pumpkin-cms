# Restore Validation Integration Plan

## Database Present

If a database artifact or approved platform backup evidence is present, the restore-plan dry-run should include:

- database artifact identity without secret values;
- checksum verification status;
- encryption/access-control status;
- sandbox restore preparation steps;
- schema/version readback expectations;
- explicit note that no live restore is approved.

## Database Absent

If the database artifact is absent, the restore-plan dry-run must mark production restore proof blocked.

## Media Blobs Present

If media blob copies are present, restore validation should:

- verify copied blob count against selected scope;
- verify checksums;
- verify content types where available;
- verify filename/path safety;
- compare copied blobs against MediaAsset metadata;
- mark media binary recovery proof as passed only if every required blob is accounted for.

## Media Metadata Only

If media remains metadata-only, restore validation should mark media restore incomplete and preserve the Phase 2F-8 status.

## No Live Restore

Phase 2F-9 and the next execution prompt must remain dry-run/sandbox-first. A real restore into CMS, database, storage, static output, or production systems requires a separate recovery approval.

