# Current State Summary

V2.2.3 is complete.

The approved OLM staging target remains readable after V2.2.2:

- provider profile: `olm-staging-cosmos-nosql-v1`
- provider type: `azure-cosmos-nosql`
- provider mode: scoped `live-write-approved`, not globally activated
- database: `pumpkincms-olm-staging`
- partition key: `/tenantKey`
- approval manifest: `olapprove_508df3f03faa4f80`
- first-write batch: `olbatch_b08e184fdc6565aa`
- expected records: `48`
- V2.2.3 additional records written: `0`
- repeat readback records: `48`
- reconciliation: passed
- rollback deletion: not executed

V2.2 should remain partial stage-ready until staging-backed Admin/API read-only integration, Backup Center staging upload proof, and API runtime QA build-lock remediation are complete.

