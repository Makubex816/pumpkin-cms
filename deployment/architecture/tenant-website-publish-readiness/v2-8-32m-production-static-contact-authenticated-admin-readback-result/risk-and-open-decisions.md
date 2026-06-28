# Risk And Open Decisions

## Risks

- The contact gate remains open until an authenticated Admin FormEntry readback can be preflighted and a single approved synthetic production POST can be read back.
- The required custom-header auth env names are now explicit, but the values were not available in this runtime.

## Open Decisions

- Provide `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`.
- Provide `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` through a hidden runtime env path.
- Rerun this bounded gate with `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE=custom-header`.

The auth value must not be printed or written.
