# Next Phase Prompt

```text
Approve V2.3.2 Azure Staging Foundation target finalization and deployment dry-run validation only: use the V2.3.1 Azure Staging Foundation inventory and IaC package to finalize the non-secret staging target worksheet, resource naming choices, provider profile candidate, Resource Registry candidate, Backup Center pre-write evidence requirements, Runtime QA evidence requirements, RBAC/identity plan, rollback/readback binding, and Bicep parameter set. Run local template validation and Azure what-if only if Azure CLI is already logged in and the command can run without secrets or mutations. Do not create Azure resources, do not mutate Azure, do not assign RBAC, do not read protected config, do not query keys/listKeys, do not generate connection strings or SAS, do not read Key Vault secret values, do not execute staging writes, do not perform CMS writes, do not perform production database migration or production writes, do not deploy, do not index, and do not publish live pages. If any value remains unresolved, output a precise missing-values report instead of proceeding to any write or deployment.
```

