# Non-Secret Provider Metadata

## Contract

Provider metadata is limited to non-secret fields:

- tenant and site keys;
- environment and profile;
- provider type and status;
- selected target provider;
- non-secret resource names when available;
- backup support flags;
- redaction status;
- blockers and warnings.

## Forbidden Fields

The validator rejects secret-bearing fields such as API-key material, connection-string material, auth headers, tokens, passwords, client secrets, SAS material, cookies, raw config, and protected config.

## Export Rule

Provider metadata never grants live database export by itself. Missing and future-target providers always block export. Configured Cosmos metadata only means a later read-only verification or export preflight can be considered.
