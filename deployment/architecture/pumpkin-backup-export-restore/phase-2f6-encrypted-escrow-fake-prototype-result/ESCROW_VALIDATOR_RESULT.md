# Escrow Validator Result

The escrow validator checks:

- required files exist;
- manifest parses;
- encrypted payload exists;
- payload is not plaintext JSON;
- approval record exists;
- recipient metadata exists;
- fake-only notice exists;
- private key material is not written;
- generated text files do not contain high-risk value patterns;
- boundaries reject real secret export and production escrow.

Validation writes:

- `escrow-validation-result.json`
- `ESCROW_VALIDATION_RESULT.md`
