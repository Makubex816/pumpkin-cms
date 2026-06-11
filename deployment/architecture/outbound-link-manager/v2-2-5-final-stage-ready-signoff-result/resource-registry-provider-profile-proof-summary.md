# Resource Registry Provider Profile Proof Summary

Resource Registry and provider profile readiness are carried from V2.3.4 and V2.2.4.

Canonical staging target facts:

- Resource group: `rg-pumpkincms-stg-eastus-olm`
- Cosmos account: `cosmos-pumpkincms-stg-olm01`
- Database: `pumpkincms-olm-staging`
- Provider profile: `olm-staging-cosmos-nosql-v1`
- Auth mode: Azure Identity / Cosmos NoSQL data-plane RBAC

V2.2.5 verified the env-contract shape with non-secret values and did not read protected config or export secrets.

Next recommended lane: V2.5.1 Resource Registry and Provider Profile Operationalization Hardening.

