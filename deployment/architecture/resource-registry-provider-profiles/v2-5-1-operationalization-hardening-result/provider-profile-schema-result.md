# Provider Profile Schema Result

Status: hardened.

The operational provider profile schema is represented by:

```text
deployment/architecture/resource-registry-provider-profiles/v2-5-1-operationalization-hardening-result/provider-profile-operational.schema.json
deployment/architecture/pumpkin-backup-export-restore/resource-registry-implementation/fixtures/operational-bindings.v2-5-1.fixture.json
```

Required profile fields:

- `providerProfileId`
- `providerType`
- `providerMode`
- `environmentName`
- `tenantScope`
- `siteScope`
- `resourceScope`
- `accountOrHost`
- `databaseOrNamespace`
- `authSessionMode`
- `readbackMethod`
- `rollbackMethod`
- `state`
- `globalActivation`
- `capabilities`
- `credentialReference.valueIncluded`
- `evidenceRefs`

Profile safety rules:

- `olm-staging-cosmos-nosql-v1` remains staging scoped.
- `production-runtime` remains blocked.
- `live-write-approved` remains scoped-only or blocked, never global.
- Live provider writes remain false in V2.5.1.
- Credential values remain excluded.

