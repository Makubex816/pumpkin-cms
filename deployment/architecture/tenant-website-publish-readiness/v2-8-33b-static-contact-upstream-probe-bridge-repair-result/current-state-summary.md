# Current State Summary

V2.8.33B closed the contact gate.

Start state:

- V2.8.33A isolated deploy succeeded.
- V2.8.33A isolated static-contact POST returned HTTP 502.
- Production was not touched in V2.8.33A.

End state:

- Direct probes identified a Pumpkin API tenant-key auth mismatch behind the static-contact 502.
- Source-required live `Tenant` container/document now exists for `ice-rink-rentals`.
- Approved static contact key verifies against the stored tenant hash.
- Static contact compat source now preserves public-safe upstream status/code on non-OK Pumpkin API responses.
- Isolated and production static-contact submissions returned HTTP 200 and were visible through authenticated Admin FormEntry readback.
