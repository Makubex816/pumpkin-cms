# Current State Summary

V2.8.46A is closed as formal deferral with no stop/delete.

The legacy static form endpoint group still exists:

- `rg-ice-static-form-endpoint`
- `func-ice-static-contact-20260605`
- `EastUSPlan`
- `iceforms20260605`

Decommission did not proceed because recent Function App metrics showed requests/executions, and storage contents could not be safely classified using approved read-only RBAC methods.

Runtime no-regression remained green.
