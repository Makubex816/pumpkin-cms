# Pumpkin Backup Onboarding Implementation Map V2.8.60Y

Date: 2026-07-05

## Recommended Sequence

1. Refresh Backup Manager and package compiler contracts.
2. Add read-only fixture-backed API/UI models.
3. Add local CLI/package compiler prototype.
4. Use Airstrip as the first benchmark.
5. Wire validator and responsive checker into operator reports.
6. Add SuperAdmin UI with disabled future actions.
7. Add controlled write preflights only after separate approvals.
8. Add production backup worker only after storage, retention, and secret-reference policy are approved.

## Non-Goals Until Later Approval

- Live backup worker.
- Live restore.
- Tenant creation.
- Media upload.
- Deploy.
- DNS/custom-domain changes.
- Indexing.
- Contact/form POST proof.
- Secret reads.

