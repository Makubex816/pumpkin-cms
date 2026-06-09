# Validator Result

## Implemented Checks

The validator checks:

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

## Output

The validator writes:

- `validation-result.json`
- `VALIDATION_RESULT.md`

## Negative Coverage

Tests verify validator failures for:

- missing required file;
- checksum mismatch;
- escrow payload in standard backup;
- secret-like value in generated bundle.
