# Committable vs Never-Committable

## Committable

- Redacted resource registry
- Resource schemas
- Credential reference schemas
- Placeholder-only examples
- Operator runbooks
- Validation rules
- Non-secret resource names and IDs when approved for registry use
- Tenant/resource mappings without credential values
- Runtime profile status names

## Never Committable

- API keys
- Account keys
- Connection strings
- SAS values
- Tokens
- Auth headers
- Cookies
- Private keys
- Raw protected config files
- Plaintext credential handoff files
- Encrypted vault payloads unless a future policy explicitly allows a private non-repo storage location

## Generated Output Rule

Future handoff packages and vaults must be written outside Git or under ignored output. Generated sensitive artifacts must not be staged.

## Validation Rule

Every future registry/handoff validation must scan for:

- Protected paths
- Plaintext credential-like values
- Unknown registry fields
- Missing credential references
- Orphaned resources
- Orphaned credentials
- Missing rotation instructions

