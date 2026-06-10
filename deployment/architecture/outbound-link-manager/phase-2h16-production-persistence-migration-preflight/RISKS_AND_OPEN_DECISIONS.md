# Risks And Open Decisions

Risks:

- production provider choice may affect query shape and cost
- per-entity containers increase operational surface
- single-container model increases query/index discipline
- trace/audit retention may grow quickly
- migration must preserve tenant/site isolation
- browser QA is still required before live writes
- rollback remains a plan until separately rehearsed

Open decisions:

- Cosmos per-entity containers vs single governance container
- whether render decisions are persisted long-term or regenerated
- trace retention duration
- audit retention duration
- provider-neutral schema package location
- staging resource naming
- Resource Registry owner for outbound link provider entries
- exact production migration batch size and conflict policy
