# CAPTCHA Upstream Assessment and Gap Closure

## Architectural fit

The implementation matches the desired tenant-first configuration model and should become the shared foundation. Secrets are referenced server-side, public configuration is resolved into FormDefinition output, and verification occurs before persistence.

## Strengths

- server-side verification interface;
- Turnstile adapter with action and hostname checks;
- tenant defaults plus per-form override;
- secret reference rather than secret value;
- shared widget used by Contact and generic Form views;
- token excluded from saved data in tests;
- missing token stops persistence;
- action validation and safer redirect validation.

## Gaps

### Verification request
- add provider-supported `idempotency_key` or stable request ID;
- deserialize provider error codes and challenge timestamp;
- use bounded timeout/retry only where safe;
- classify transport/JSON/cancellation failures;
- emit metrics without tokens, secrets, or submitted message content.

### Client lifecycle
Reset/clear after provider rejection, expiry/replay, action/hostname failure, later server failure after token consumption, and network ambiguity. API responses should safely indicate whether a new challenge is required.

### Submission reliability
CAPTCHA proves a challenge, not uniqueness. Add submission/correlation IDs and exact-one idempotency. Rate limiting must work across instances and restarts.

### Operations
Require production hostnames, document/test CSP, use environment-specific references, use provider test keys in nonproduction, stage enablement, define outage policy, and define privacy/retention.

## Recommended error shape

```json
{
  "code": "captcha_expired",
  "message": "Please complete a new verification challenge.",
  "retryable": true,
  "requiresNewCaptcha": true,
  "correlationId": "..."
}
```

Never return provider secrets, raw tokens, or internal exception details.
