# Deferred Legacy Endpoint Plan If Any

Deferred candidate:

- `rg-ice-static-form-endpoint`

Required next proof before any future stop/delete:

- Determine whether the 30-day Function App `Requests` and `FunctionExecutionCount` activity represents real clients, platform probes, or controlled internal checks.
- Wait for or prove a clean zero-traffic observation window after the managed SWA static contact path remains stable.
- Classify storage contents without keys/listKeys/SAS unless a future approval explicitly authorizes an alternate preservation or read mechanism.
- If storage may contain user/business data, approve export/preservation before any deletion.
- Run pre-stop GET-only runtime proof.
- Stop the Function App only under explicit future approval.
- Run post-stop GET-only runtime proof.
- Delete resources only after post-stop proof stays green and storage preservation/classification is complete.

Suggested next approval:

```text
Approve V2.8.46B Legacy Static Form Endpoint Zero-Traffic Observation and Storage Preservation Proof only.

Use the completed V2.8.46A result package. Re-query Function App and storage metrics after a bounded observation window, classify whether recent requests/executions were real dependency traffic, and establish a storage preservation/classification plan for `iceforms20260605`. Do not stop or delete resources unless a later separate approval explicitly authorizes stop/delete after zero-traffic and storage proof pass. Do not deploy, do not mutate DNS/custom domains, do not mutate appsettings, do not send contact POSTs, do not mutate content, do not read protected config, do not query Key Vault secrets, do not use keys/listKeys/SAS/connection strings, and do not stage `.tmp`.
```
