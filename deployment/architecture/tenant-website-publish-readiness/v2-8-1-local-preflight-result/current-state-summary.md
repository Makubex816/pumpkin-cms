# Current State Summary

V2.8.1 is complete as a local/read-only tenant website publish-readiness preflight.

Recommended tracker state:

| Field | Value |
| --- | --- |
| Current reference | `V2.8.1` |
| Current lane | `V2.8 Tenant Website / Publish Readiness` |
| Provisional V2 overall completion | `86%` |
| V2.8 completion | `62%` |
| Result | `complete_local_readonly_preflight_publish_blocked` |

The platform dependencies are in good shape:

- V2.2 OLM is stage-ready and evidence-frozen.
- V2.5 Resource Registry / Provider Profile operational bindings validate locally.
- V2.6 Runtime QA harness validates locally and produced V2.8.1 evidence.
- V2.7 Admin/API Operator Console is signed off.
- Backup Center Phase 2F-14 provides Ice live-readonly Cosmos/media backup proof.

The tenant website publish decision remains blocked because the current safe local Ice seed-site path is stale relative to the approved launch route shape. It still contains `/ice-rink-rentals` and `/events-holiday-activations`, and it lacks `/service-areas`.
