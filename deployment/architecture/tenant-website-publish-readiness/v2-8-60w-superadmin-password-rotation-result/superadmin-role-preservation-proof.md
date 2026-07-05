# SuperAdmin Role Preservation Proof

Status: pre-rotation proof only.

Pre-rotation login:

- Login succeeded.
- Returned role: `SuperAdmin`.
- Returned tenantId: `ice-rink-rentals`.

Post-deploy-failure login with the current password:

- Login succeeded.
- Returned role: `SuperAdmin`.
- Returned tenantId: `ice-rink-rentals`.

Because rotation did not occur, post-rotation role preservation proof was not applicable. Source tests proved the new route preserves stored role and tenant during password rotation.
