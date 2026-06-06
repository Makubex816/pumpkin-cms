# Local Package Verification

Generated: 2026-06-05

Run from:

```text
deployment/static-azure/forms/static-form-endpoint
```

| Command | Exit | Result |
| --- | --- | --- |
| `npm run check` | 0 | pass |
| `npm test` | 0 | pass |

The local tests include mocked Graph token/sendMail behavior. No real token was requested and no real email was sent.

## Package Build

The deployment package was built in `%TEMP%`.

Package validation:

| Check | Result |
| --- | --- |
| required Function files present | pass |
| `graph-send-mail-delivery.mjs` present | pass |
| runtime `@azure/functions` dependency present | pass |
| root local settings/tests/samples/docs excluded | pass |

The temporary zip and staging directory were removed after deployment.

