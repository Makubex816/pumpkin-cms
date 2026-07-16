# Next phase prompt

Start V2.8.63D from this exact CRSTUR closeout state.

Current state:

- Branch: `feature/admin-page-editor-import-export`
- HEAD: `87ba5cd0ec305d30b9345ea95475c1b7fcde1c62`
- Production API deployment: `c9451f4b-0b2e-44bc-9d08-ac9b767a6c05`
- Rollback slot deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- Production Admin deployment: `8c960132-3521-45c7-9a16-d5265ddbb640`
- Admin build ID: `jXp9rYv0Dcu7KPH6sq1xI`
- Final capacity: S2 / two workers
- Final capacity decision: `retain_s2_two_workers_with_evidence`
- Identity foundation, dual-read, dual-write, and management Stages 1-7: enabled
- Tenant rename, migration execution, and external notification provider: disabled
- Capacity diagnostics: disabled
- TenantAdmin transfer pilot: held
- Provider-backed self-service email and forgot-password delivery: held because no provider is configured
- Airstrip public runtime: not requested
- Indexing: unchanged

Do not replay:

- candidate-four API deployment,
- slot Stage A/Stage B,
- production swap,
- production API login proof,
- Admin deployment, or
- the S1/two-worker retention test.

Carry forward these evidence roots:

- `.tmp/v2-8-63crstu/evidence/identity-management-stages-attempt-11`
- `.tmp/v2-8-63crstu/evidence/final-capacity-decision`
- `.tmp/v2-8-63crstu/evidence/final-runtime-smoke-after-capacity-diagnostics-disabled`
- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane`
- `.tmp/v2-8-63crstu/evidence/final-customer-preservation-after-capacity-closeout`

Begin V2.8.63D only with scoped work that preserves the production API/Admin promotion, rollback slot, dual-write, management activation, customer credentials, customer tenant names, public runtime boundaries, and indexing boundary.
