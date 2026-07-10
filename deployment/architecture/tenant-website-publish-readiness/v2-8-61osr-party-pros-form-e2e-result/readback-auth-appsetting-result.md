# Readback Auth Appsetting Result

Result: not set.

Source discovery found no runtime application source requiring the `PUMPKIN_FORMENTRY_READBACK_AUTH_*` variables as App Service appsettings.

The approved proof mode still requires an operator-side custom-header request:
- header name from `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`;
- header value from `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`.

The secure handoff did not provide a non-empty header value, and the shell did not contain the value. Therefore OSR did not set readback auth appsettings and did not attempt Admin FormEntry readback.

No auth value was printed.
