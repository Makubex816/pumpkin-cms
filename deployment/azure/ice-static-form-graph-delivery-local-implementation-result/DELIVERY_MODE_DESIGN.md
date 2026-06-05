# Delivery Mode Design

Generated: 2026-06-05

## Mode Resolution

The endpoint resolves delivery mode in this order:

1. `FORM_DELIVERY_MODE`
2. legacy `STATIC_FORM_FORWARD_MODE`
3. default `dry-run`

Supported modes:

| Mode | Behavior |
| --- | --- |
| `dry-run` | validate and accept without external delivery |
| `no-email` | alias for `dry-run` |
| `graph` | use the local Graph sendMail adapter |
| `m365-graph` | alias for `graph` |
| `pumpkin-api` | forward to Pumpkin API, preserving legacy package behavior |

Missing or unknown modes fall back to:

```text
dry-run
```

## Safety

Graph mode is opt-in. It requires placeholder server-side env vars and fails closed before any token/sendMail request when required values are missing.

Invalid payloads still reject before delivery mode runs.

