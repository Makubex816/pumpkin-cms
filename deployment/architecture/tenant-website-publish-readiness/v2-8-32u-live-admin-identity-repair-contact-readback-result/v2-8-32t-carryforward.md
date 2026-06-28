# V2.8.32T Carryforward

V2.8.32T established:

- `providerConfigured:false` in health is hardcoded in source and not a real provider readiness probe.
- Redacted App Service checks showed provider settings and `Jwt__SecretKey` were present, non-empty, and matched the secure file.
- Live Admin login returned HTTP 401, not the previous provider connection exception.
- No bearer token was issued.
- No Admin readback and no production contact POST occurred.

V2.8.32U accepted the active blocker `admin_login_unauthorized_after_provider_binding` and attempted a source-discovered Admin identity repair.

