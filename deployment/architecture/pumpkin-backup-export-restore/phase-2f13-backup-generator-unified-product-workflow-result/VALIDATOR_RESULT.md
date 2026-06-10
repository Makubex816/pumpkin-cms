# Validator Result

`production-restore-proof` validation passed for both generated bundles.

| Bundle | Checked files | Checksum entries | Connector proof | Secret scan | Result |
| --- | ---: | ---: | --- | --- | --- |
| Fake complete | 54 | 50 | passed | passed | passed |
| Live-readonly Ice | 62 | 58 | passed | passed | passed |

Validation reports written by the generator:

- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`
- `validation-result.json`

The validator enforces folder-bundle output, manifest membership, checksum consistency, standard-mode escrow exclusion, protected path blocking, secret-like value scanning, complete Cosmos proof, complete media proof, and tenant website bundle presence.
