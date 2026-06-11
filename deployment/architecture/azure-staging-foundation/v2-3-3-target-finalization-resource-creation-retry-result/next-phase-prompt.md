# Next Phase Prompt

```text
Approve V2.3.4 Azure Staging RBAC, provider profile activation, and readback preflight only: use the created V2.3.3 PumpkinCMS staging Azure foundation to finalize the explicit staging-scoped RBAC principal, role, and scope; assign only the approved minimum Cosmos data-plane and evidence-storage RBAC if safe; register or update the repo-supported non-secret Outbound Link Manager staging provider profile; validate management-plane and data-plane readback without keys/listKeys, connection strings, SAS, protected config, or secret export; update Resource Registry, Backup Center, Runtime QA, Source-of-Truth, tracker, blockers, and result package. Do not execute the OLM first-write batch, do not write OLM records, do not perform production database migration or production writes, do not perform CMS writes, do not deploy apps, do not index, and do not publish live pages. Stop before RBAC or readback if principal, role, scope, provider profile, or identity/session values remain ambiguous.
```

