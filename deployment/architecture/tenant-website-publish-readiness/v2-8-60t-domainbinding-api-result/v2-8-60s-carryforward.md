# V2.8.60S Carryforward

V2.8.60S completed the Tenant Domain Binding Manager contract.

Carried forward:

- DomainBinding sidecar model partitioned by `/tenantId`.
- SuperAdmin-only control-plane workflow.
- DNS packet history, validation, Azure hostname/TLS state, runtime proof, canonical promotion, rollback, and audit history.
- Manual DNS packet mode as baseline.
- Bluehost owner-assisted mode as Airstrip first provider.
- Airstrip default host remains live.
- Airstrip DNS/custom-domain binding remains paused until the manager can prove readiness.

