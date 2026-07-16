# Customer preservation, cleanup, and rollback

Synthetic cleanup completed in Attempt 11 and was proven idempotent.

Cleanup result:

- First pass: true
- Second idempotent pass: true
- Synthetic account disabled: true
- Legacy user disabled: true
- Temporary memberships revoked: true
- Synthetic sessions revoked: true
- Contact snapshot restored and redacted: true
- Customer primary admins restored: true
- Credential handoff inactive: true
- Synthetic login rejected: true
- Audits preserved: true

Final identity readback after capacity closeout:

- Tenants: 4
- Accounts: 6
- Memberships: 8
- Tenant contact settings: 4
- Form entries: 12
- Completed identity runs: 1
- Login dual-writes: 3
- Login dual-write audits: 304
- Pending reconciliations: 0
- Pending security mutations: 0
- Pending synthetic operations: 0
- Pending audits: 0
- Reconciliation clear: true

The account/membership counts include the disabled/revoked synthetic validation residue preserved for auditability. Customer password, login email, ownership, membership, contact, and form-entry preservation passed.

Rollback remains ready:

- API rollback slot: `crr-validation`
- Deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- State: Running
- Production swap target: clear

Evidence:

- `.tmp/v2-8-63crstu/evidence/identity-management-stages-attempt-11/synthetic-cleanup-result.json`
- `.tmp/v2-8-63crstu/evidence/final-customer-preservation-after-capacity-closeout/tool-final-identity-verify/production-identity-readback.json`
- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane/api-state.json`
