# Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner/Action |
| --- | --- | --- | --- | --- |
| Secondary tenant created without secure handoff discipline | High | Medium | Require ignored secure file and redacted reporting. | V2.8.53 approval. |
| Secondary tenant mutation affects Ice | High | Medium | Use SuperAdmin only with explicit tenant ID checks and final Ice no-regression. | Creation preflight. |
| Media upload leaves orphan blobs | Medium | Medium | Use proof prefix, readback, and cleanup plan before broad upload. | Media phase. |
| Contact route misconfigured for secondary | High | Medium | Health preflight before any POST; one approved synthetic POST only after readback auth. | Contact proof phase. |
| Legacy endpoint deletion breaks unknown traffic | Medium | Medium | Keep deferred until traffic/storage classification clears. | Decommission retry. |
| App Service backup gap | Medium | Low | Preserve snapshots and Cosmos backup; approve backup storage plan if policy changes. | Ops hardening. |
| Admin route-ready modules mistaken for workflow-proven | Medium | Medium | Label route-present modules separately from CRUD/workflow-proven modules. | Build map. |
| DNS/indexing run too early | High | Low | Keep as final separate gates after production cutover proof. | Cutover lane. |
