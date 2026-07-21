# Terminology and Sources of Truth

## Repository vocabulary

| Term | Meaning |
|---|---|
| **Moving upstream** | Partner-owned `SDI-AI/pumpkin-cms/main`. It can change at any time. |
| **Upstream intake candidate** | A newly observed exact upstream SHA before immutability and qualification. |
| **Immutable upstream snapshot** | Exact Git object pinned by full SHA plus protected reference, provenance manifest, and archive/bundle checksum. |
| **Qualified upstream baseline** | An immutable snapshot that passed clean-room build, tests, contract/security review, and reproducibility checks. |
| **Public downstream history** | Public `Makubex816/pumpkin-cms` history. It proves lineage, not necessarily the active product state. |
| **Active downstream product** | The actual working product branch/repository/deployment source, identified from local/private source and closeout evidence. |
| **Semantic reconciliation** | Compare behavior, contracts, data ownership, security, and operational effects before integrating source. |
| **Direct adopt** | Use upstream implementation substantially unchanged after qualification. |
| **Adapt or port** | Carry the upstream behavior into downstream architecture with bounded modifications. |
| **Wrap and extend** | Preserve upstream contract while adding downstream reliability, security, or control-plane behavior. |
| **Atlas** | Versioned map of architecture, lineage, capabilities, decisions, milestones, evidence, and next gates. |
| **Current build closeout** | Authoritative package from the running phase: commits, deployments, tests, IDs, readback, modes, blockers, and Atlas state. |

## Instruction authority

```text
1. Security, privacy, tenant isolation, payment compliance, and legal constraints
2. Explicit current owner instruction
3. Active phase contract
4. Operating Contract
5. Accepted architecture and Atlas decisions
6. Historical phase documents
7. Assumptions
```

## Factual authority

```text
1. Fresh authoritative live readback
2. Exact Git object or signed/hashed result artifact
3. Current build closeout linked to source/deployment evidence
4. Active Atlas entry linked to evidence
5. Current-state package fact linked to evidence
6. Partner/owner statement of intent
7. Historical public commit history
8. Assumption
```

## Source status vocabulary

```text
observed_unqualified
qualified
integrated_unproven
integrated_and_proven
claimed_unverified
blocked_external
blocked_defect
not_observed
not_applicable
superseded
```

## Critical rule for this intake

The upstream head is **observed**, not yet immutable or qualified. The public downstream `main` is **historical lineage**, not the active build source. No package may collapse those distinctions into a single “latest code” statement.
