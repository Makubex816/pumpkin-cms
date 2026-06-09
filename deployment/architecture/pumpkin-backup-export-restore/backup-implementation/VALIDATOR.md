# Validator

The backup validator checks:

- bundle is a folder;
- required files exist;
- manifest parses and declares standard folder mode;
- `includesEscrow` is false;
- manifest file list matches generated content files;
- checksums exist and match;
- `escrow/ESCROW_NOT_INCLUDED.md` exists;
- standard backup contains no escrow payload files;
- generated file paths avoid protected config names;
- generated text has no obvious secret-like values.

The validator writes:

- `validation-result.json`
- `VALIDATION_RESULT.md`

Secret scan failures, protected path hits, missing required files, checksum mismatches, and escrow payloads fail validation.
