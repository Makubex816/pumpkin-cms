# Resource Registry Update Requirements

Before production persistence is enabled, the Resource Registry must describe the target without storing secrets.

Required registry entries:

- provider type
- environment name
- tenant key
- site key
- database/account name or provider identifier
- container/table names
- partition key path
- credential reference ID without value
- approved principal reference
- read-only profile support
- write-approved profile gate status
- backup dependency
- rollback dependency
- owner contacts
- validation command references

Forbidden registry content:

- keys
- connection strings
- SAS URLs
- JWTs
- auth headers
- cookies
- deployment tokens
- private keys

Resource Registry updates should be generated as a dry-run proposal before any registry write is approved.
