# Operator Checklist

## Before Execution Approval

- Confirm owner approves database/media completion execution.
- Select database mode:
  - Azure SQL platform backup evidence;
  - BACPAC/export artifact to private storage;
  - `sqlpackage` export to ignored local output;
  - no database artifact.
- Select media mode:
  - metadata-only;
  - local blob copy under ignored `.tmp`;
  - private backup storage copy;
  - manifest-only evidence.
- Confirm output root and retention.
- Confirm whether Azure actions are allowed.
- Confirm whether storage-side copy is allowed.
- Confirm whether local disk capacity is sufficient for media copy mode.
- Confirm no protected config read is required.
- Confirm no standard backup escrow payload is included.

## During Future Execution

- Run presence-only env checks in the same terminal/session.
- Print only PRESENT/MISSING.
- Refuse execution if required env/tooling is missing.
- Create artifacts only under approved output/storage target.
- Generate checksums.
- Update manifest/status files.
- Run validator.
- Run restore-plan dry-run.
- Do not stage generated backup artifacts.

## After Future Execution

- Review validation report.
- Review restore-plan result.
- Confirm no secret values were written.
- Confirm database/media artifacts are ignored or privately stored.
- Decide whether the backup can be classified as production restore proof.

