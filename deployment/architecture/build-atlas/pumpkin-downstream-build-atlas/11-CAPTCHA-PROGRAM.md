# CAPTCHA Program — Upstream Adoption and Production Hardening

## Decision

`ADOPT_UPSTREAM_CONTRACT_AND_HARDEN`

Do not create a parallel incompatible CAPTCHA model.

## Preserve upstream contract

```text
TenantSettings.FormSecurity.Captcha
- provider
- siteKey
- secretKeyReference
- enabledByDefault
- allowedHostnames

FormDefinition.SpamProtection.Captcha
- mode: inherit | required | disabled
- provider/siteKey: public resolved output
- action
```

## Required hardening

1. Add bounded verification idempotency and a stable request identifier.
2. Reset the client widget/token after every attempt that can consume it, not only success.
3. Capture provider `error-codes`, action, hostname, challenge timestamp, latency, and outcome without raw token or secret.
4. Classify network, timeout, provider 5xx, malformed response, and configuration failures.
5. Require allowed hostnames for production tenants.
6. Add documented CSP and script-loading policy.
7. Add accessibility and no-JavaScript/error recovery behavior.
8. Move rate limiting to a distributed store or edge control for multi-instance correctness.
9. Integrate verification into the submission-idempotency transaction.
10. Prove tenant-scoped configuration and cross-tenant denial.

## Verification matrix

| Case | Expected result |
|---|---|
| valid token/action/hostname | exactly one FormEntry |
| missing token | 400; zero FormEntry |
| malformed/oversize token | 400; zero FormEntry |
| provider failure token | 400; zero FormEntry |
| action mismatch | reject; zero FormEntry |
| hostname mismatch | reject; zero FormEntry |
| expired token | retryable user error; reset widget; zero FormEntry |
| replayed token | reject; reset widget; zero additional FormEntry |
| provider timeout/outage | explicit unavailable state; zero FormEntry; safe retry |
| duplicate browser submit | one FormEntry through submission idempotency |
| two application instances | distributed limit/idempotency remains correct |
| approved disabled policy | normal validation and persistence continue |

Store only a secret-manager/configuration reference in tenant data. Public definitions may expose a public site key, never the secret value. Raw challenge tokens must not be persisted or logged.
