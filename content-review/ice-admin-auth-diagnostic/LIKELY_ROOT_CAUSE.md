# Likely Root Cause

Current classification: `unknown` because no token was present for shape inspection or auth probing during this diagnostic run.

Evidence gathered from source:

- The correct browser storage key is `pumpkin_auth_token`.
- The stored value should be a raw JWT, not `pumpkin_user` JSON or `pumpkin_current_tenant` JSON.
- The temp file should contain the raw JWT without a `Bearer ` prefix.
- The API expects the helper/import script to send `Authorization: Bearer <token>`.
- The API returns 401 when token validation fails before endpoint tenant/role logic runs.
- The API validates issuer, audience, lifetime, and signing key.

Most plausible causes for the earlier 401:

- Wrong localStorage key copied.
- JSON wrapper copied instead of the raw JWT.
- `Bearer ` prefix copied into the file and then duplicated by the caller.
- Expired browser token.
- Token issued before an API restart or signing key change.
- Issuer/audience mismatch with the running API instance.
- Token from a different API/frontend session than `http://localhost:5064`.

Tenant or role mismatch is less likely for the observed 401. The admin page endpoints would normally return 403 after successful token validation if the token is valid but lacks permission for `ice-rink-rentals`.

