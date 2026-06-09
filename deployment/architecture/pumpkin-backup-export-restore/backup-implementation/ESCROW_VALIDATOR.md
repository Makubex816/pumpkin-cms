# Escrow Validator

The fake escrow validator checks:

- required files exist;
- escrow manifest parses;
- encrypted payload exists;
- encrypted payload is not plaintext JSON;
- recipient metadata exists;
- approval record exists;
- fake-only notice exists;
- recipient metadata contains public metadata only;
- private key material is not written;
- generated text files do not contain high-risk value patterns;
- boundaries reject real secret export and production escrow.

The validator writes:

- `escrow-validation-result.json`
- `ESCROW_VALIDATION_RESULT.md`

Validation reports must not contain fake payload values.
