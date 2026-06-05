# Rollback To Dry Run

Generated: 2026-06-05

Dry-run/no-email remains the rollback mode.

Future rollback setting:

```text
FORM_DELIVERY_MODE=dry-run
```

Legacy no-email setting remains compatible:

```text
STATIC_FORM_FORWARD_MODE=dry-run
```

Rollback effect:

- endpoint validates payloads
- endpoint returns safe success for valid payloads
- no Graph token request occurs
- no email is sent
- static routes and media are unaffected

If production email verification is ever withdrawn, contact form production readiness returns to:

```text
no
```

