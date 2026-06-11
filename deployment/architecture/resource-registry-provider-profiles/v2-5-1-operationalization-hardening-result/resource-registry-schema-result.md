# Resource Registry Schema Result

Status: hardened.

The operational Resource Registry schema is represented by:

```text
deployment/architecture/resource-registry-provider-profiles/v2-5-1-operationalization-hardening-result/resource-registry-operational.schema.json
deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/fixtures/operational-bindings.v2-5-1.fixture.json
```

Required control-layer concepts:

- non-secret operational identifiers only
- resource binding IDs and target names
- environment names
- tenant/site scope
- provider profile relationships
- credential reference IDs without values
- evidence references
- freshness/status state
- blocked or scoped provider-mode state

Forbidden concepts:

- credential values
- keys/listKeys output
- connection strings
- SAS values or URLs
- tokens, cookies, auth headers, private keys, protected config, or raw credential material
- unredacted subscription IDs in committed operational bindings

