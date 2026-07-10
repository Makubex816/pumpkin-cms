# Form Reproof Gate Result

Required auth mode: `custom-header`.

Required request inputs:

- header name from `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`;
- header value from `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`.

Fresh environment presence check:

| Scope | Mode | Header name | Header value |
| --- | --- | --- | --- |
| Process | absent | absent | absent |
| User | absent | absent | absent |
| Machine | absent | absent | absent |

The prior OSF secure handoff was intentionally removed after OSF closeout. No alternate approved value source was present. Therefore OSHR did not construct or send an authenticated readback request and did not print or persist an auth value.

Gate result: `readback_custom_header_env_missing`. Controlled form submission was prohibited and not attempted.

