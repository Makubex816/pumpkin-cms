# Non-Secret Metadata Contract Result

## Implemented

The metadata contract allows only non-secret provider source fields and rejects unknown or forbidden fields.

Forbidden categories include:

- API-key material;
- connection-string material;
- auth headers;
- tokens;
- passwords;
- client secrets;
- SAS material;
- cookies;
- raw config;
- protected config.

## Validation

`provider-source.forbidden-field.json` proves the validator rejects forbidden field names. The CLI summary test proves only summary fields are printed.

## Contract Boundary

The contract does not include raw tenant records, user records, page payloads, form submissions, media payloads, database documents, or protected config values.
