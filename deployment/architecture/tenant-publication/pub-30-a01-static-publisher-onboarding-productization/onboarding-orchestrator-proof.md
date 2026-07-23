# Onboarding orchestrator proof

The generic publication job has 16 dependency-ordered steps:

1. tenant intake;
2. identity provisioning;
3. content import;
4. hosting-class selection;
5. product-release assignment;
6. artifact build;
7. frontend-resource plan;
8. publication registration;
9. deployment;
10. public-form preflight;
11. controlled form proof;
12. domain hold;
13. acceptance;
14. indexing hold;
15. backup;
16. Atlas registration.

Canonical plans produce deterministic plan, job, and step IDs. Each step records dependencies, planned action, approval gate, attempts, outcome digest, partial result, resume history, and optional rollback action. Reusing an idempotency key with different input fails; identical replay is a no-op. Rollback walks successful reversible steps in reverse order and records its own idempotency boundary.

Generated plans exist for a generic future tenant, Ice, Party Pros, and Vegas. Each customer plan is local-only, has domains/indexing held, and cannot deploy. External-DNS and Azure-DNS handoffs are generated as held documents. Airstrip is metadata-only.

Source validation of job resume, retry, no-op, partial success, authorization, and rollback passed at final technical source commit `aab6823bd265cf91e77868a6649dd984016837b9`. Both clean roots generated the same 24-file current-tenant output inventory, SHA-256 `ed33ad67abab8a04b08e6f91b5d3689269b5d0041c702003864fae6137a92f74`, including the local plans and held handoffs. No onboarding job was run against live customer or synthetic state.
