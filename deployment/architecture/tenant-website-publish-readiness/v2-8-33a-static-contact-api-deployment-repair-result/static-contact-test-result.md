# Static Contact Test Result

Commands run:

- `npm run check` from `deployment/static-azure/forms/static-form-endpoint-compat`
- `npm test` from `deployment/static-azure/forms/static-form-endpoint-compat`

Results:

- Syntax check: passed.
- Test suite: passed.
- Test count observed: 9 passing checks.

Covered behavior includes:

- Health sentinel.
- OPTIONS preflight.
- Frontend alias payload handling.
- Dry-run/no-email modes.
- Pumpkin API forwarding.
- Safe failures for missing Pumpkin API base URL or protected key.
- Rejection of mismatched Ice form id.
- Invalid email rejection without secret echo.
