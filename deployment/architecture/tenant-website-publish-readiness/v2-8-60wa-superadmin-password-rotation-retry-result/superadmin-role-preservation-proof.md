# SuperAdmin Role Preservation Proof

Status: preserved for current active credential; post-rotation proof not applicable.

Proofs:

- Pre-rotation current password login succeeded with role `SuperAdmin`.
- After rejected rotation, current password login still succeeded with role `SuperAdmin`.
- SuperAdmin API access succeeded:
  - `GET /api/admin/tenants`: HTTP 200.
  - `GET /api/admin/users`: HTTP 200.
  - `GET /api/admin/domain-bindings`: HTTP 200.
- Admin UI route checks succeeded:
  - `/dashboard/onboarding`: HTTP 200.
  - `/dashboard/onboarding/domains`: HTTP 200.

Post-rotation role preservation proof could not be completed because rotation did not complete.
