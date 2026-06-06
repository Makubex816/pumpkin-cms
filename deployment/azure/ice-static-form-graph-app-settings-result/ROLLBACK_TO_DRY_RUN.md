# Rollback To Dry Run

Generated: 2026-06-06

No rollback was required in this setup pass because the endpoint remained in no-send mode.

## Current No-Send State

```text
FORM_DELIVERY_MODE=no-email
STATIC_FORM_FORWARD_MODE=dry-run
```

## Future Rollback

If a future live email test enables Graph mode and needs rollback:

1. Set `FORM_DELIVERY_MODE=no-email`.
2. Confirm Graph mode is inactive by name/status-only app setting check.
3. Run safe endpoint health checks.
4. Do not remove the client credential unless a separate credential cleanup approval is granted.

