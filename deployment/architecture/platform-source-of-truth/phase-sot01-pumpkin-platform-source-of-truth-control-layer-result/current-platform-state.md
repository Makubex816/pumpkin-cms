# Current Platform State

PumpkinCMS is in a pre-production platform-operations state with strong local/offline tooling, Backup Center proof, Resource Registry proof, Runtime QA proof, and Outbound Link Manager implementation through scoped staging readiness hardening.

Current canonical lane:

- Phase 2H, Outbound Link Manager / Tenant Link Governance.

Latest completed phase:

- Phase 2H-23B, OLM hardening completion and staging target/profile closure.

Current control phase:

- Phase SOT-01, source-of-truth control layer.

Current hard stop:

- Missing canonical `OLM_STAGING_*` target/profile/session/readback/rollback contract.

The platform must remain in local/offline, fake-provider, staging-simulated, or explicit live-readonly modes until a future approval unblocks a scoped staging write.

