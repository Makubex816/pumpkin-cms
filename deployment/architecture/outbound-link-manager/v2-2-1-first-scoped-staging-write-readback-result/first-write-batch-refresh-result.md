# First-Write Batch Refresh Result

Status: partially refreshed and blocked before write.

The existing first-write package validates for:

- approval manifest ID `olapprove_508df3f03faa4f80`
- first-write batch ID `olbatch_b08e184fdc6565aa`
- expected record count `48`
- no real staging provider write performed

The V2.3.4 `OLM_STAGING_*` contract was supplied during validation and package linkage passed.

The executable package remains blocked because the existing package provider mode is `staging-simulated` and the repo does not contain a live Azure Cosmos NoSQL staging write/readback adapter for `olm-staging-cosmos-nosql-v1`.
