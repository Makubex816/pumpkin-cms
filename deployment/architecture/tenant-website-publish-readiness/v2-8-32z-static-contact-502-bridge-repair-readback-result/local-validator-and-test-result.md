# Local Validator And Test Result

Local static-contact tests:

- Command: `npm test` in `deployment/static-azure/forms/static-form-endpoint-compat`.
- Result: passed.
- Tests passed: 9.
- Tests failed: 0.

The tests confirm:

- Health sentinel succeeds.
- OPTIONS preflight works.
- Frontend alias payload is accepted.
- Pumpkin API mode forwards valid FormEntry payload.
- Missing bridge config fails safely.
- Invalid Ice form IDs are rejected before persistence.
- Invalid email is rejected without echoing secrets.

No source edits were made in V2.8.32Z.
