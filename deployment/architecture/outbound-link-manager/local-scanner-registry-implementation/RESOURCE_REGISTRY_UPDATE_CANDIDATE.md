# Resource Registry Update Candidate

The migration dry-run writes `RESOURCE_REGISTRY_UPDATE_CANDIDATE.json` as a redacted proposal for a future Resource Registry update. It is not applied by this package.

The candidate includes:

- provider type
- environment
- account reference
- database name
- partition key
- target entity/container names
- credential reference ID without a value
- required provider profiles
- boundary flags showing production writes and live provider writes remain disabled

The file intentionally excludes credential values, keys, connection strings, SAS values, JWTs, and protected config paths. Any future Resource Registry write requires a separate approval and must keep local/offline profiles available.
