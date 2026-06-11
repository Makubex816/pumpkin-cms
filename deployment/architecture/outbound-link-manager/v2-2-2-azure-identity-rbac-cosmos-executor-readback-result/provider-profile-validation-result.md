# Provider Profile Validation Result

Status: passed.

Provider profile:

```text
olm-staging-cosmos-nosql-v1
```

Provider type:

```text
azure-cosmos-nosql
```

Provider mode:

```text
live-write-approved
```

The generic provider validator still reports `liveWriteAllowed: false`; scoped write permission is granted only by the V2.2.2 adapter gate after all approved IDs, target values, and contract fields match.
