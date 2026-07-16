# CRSTUR closeout ingestion

CRSTUR is committed and was not duplicated.

Verified record:

- Result path: `deployment/architecture/identity/v2-8-63crstu-readiness-identity-activation-result/`
- Documentation commit: `7c252060d18df4001586e61f1ed8db0d152f1d01`
- Commit subject: `docs: close out CRSTUR identity activation`
- CRSTUR recorded source head: `87ba5cd0ec305d30b9345ea95475c1b7fcde1c62`
- Final CRSTUR status: `complete_readiness_gate_management_active_tenantadmin_transfer_pilot_held_retain_s2_ready_for_63d`

CRSTUR production carryforward:

- API deployment: `c9451f4b-0b2e-44bc-9d08-ac9b767a6c05`
- API package SHA-256: `0cdd1dea1ff7a39d2484a7e3b36f1a0b2f76501f714732ba47c1c18452b0e7d4`
- Rollback slot: `crr-validation`
- Rollback slot deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- Admin deployment: `8c960132-3521-45c7-9a16-d5265ddbb640`
- Admin build ID: `jXp9rYv0Dcu7KPH6sq1xI`
- Final capacity: S2 / two workers
- Identity readback from CRSTUR: 4 tenants, 6 accounts, 8 memberships, 4 contact settings, 12 FormEntries, and zero pending reconciliation/security/synthetic/audit operations.

CUR-20 did not replay any CRSTUR action and did not alter historical CRSTUR evidence.

