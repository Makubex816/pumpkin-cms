# Immutable promotion and production proof

CRSTUR preserved the completed API and Admin promotions. It did not redeploy the API candidate, replay the production swap, or redeploy Admin.

Production API:

- App: `app-pumpkin-api-prod-centralus-001`
- Deployment: `c9451f4b-0b2e-44bc-9d08-ac9b767a6c05`
- Package SHA-256: `0cdd1dea1ff7a39d2484a7e3b36f1a0b2f76501f714732ba47c1c18452b0e7d4`
- Final health: HTTP 200
- Final readiness: HTTP 200
- Final feature state: foundation, dual-read, dual-write, and management Stages 1-7 enabled

Rollback slot:

- Slot: `crr-validation`
- Deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- State: Running
- Swap target: clear

Production Admin:

- App: `app-pumpkin-admin-prod-centralus-001`
- Deployment: `8c960132-3521-45c7-9a16-d5265ddbb640`
- Build ID: `jXp9rYv0Dcu7KPH6sq1xI`
- Package SHA-256: `4a832102647f3fa56bc08c69c4a913e39dddaabb783737d2b1a9820979a0811f`
- Production route smoke: passed before management activation

Final runtime smoke after capacity closeout passed with health 200, readiness 200, SuperAdmin and TenantAdmin login 200, six cross-tenant 403 denials, two no-write lead preflights, unchanged form-entry totals, and 21/21 public/current-tenant GETs.

Evidence:

- `.tmp/v2-8-63crstu/evidence/final-closeout-control-plane/api-state.json`
- `.tmp/v2-8-63crstu/evidence/admin-immutable-deployment/immutable-admin-deployment-closeout.json`
- `.tmp/v2-8-63crstu/evidence/final-runtime-smoke-after-capacity-diagnostics-disabled/runtime-smoke-result.json`
