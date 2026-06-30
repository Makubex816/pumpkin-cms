# Legacy Resource Status

Legacy static form endpoint resource group:

`rg-ice-static-form-endpoint`

Status: present and deferred.

Resources still present:

- `func-ice-static-contact-20260605`
- `EastUSPlan`
- `iceforms20260605`

Reason for deferral from V2.8.46A:

- Recent Function App requests/executions were observed.
- Storage blob contents were not fully classified with approved RBAC-only methods.

V2.8.52 action:

- Read-only inventory confirmed the group and three resources still exist.
- No stop/delete was performed.

Next action:

- Run a separate approved decommission retry only after traffic is quiet and storage contents can be classified or preserved.
