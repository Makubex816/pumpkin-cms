# Cosmos Provisioning Readiness Plan

## Purpose

If provider-source resolution confirms that no existing Ice database exists, the next target is Azure Cosmos DB. The readiness plan prepares for that decision without creating resources.

## Readiness Inputs

- owner-confirmed Azure tenant and subscription scope;
- owner-confirmed resource group strategy;
- account naming plan;
- database naming plan;
- container naming and partitioning plan;
- backup policy choice;
- region and redundancy decision;
- RBAC/managed identity strategy;
- cost and retention expectations;
- rollback and abort rules.

## Proposed Cosmos Shape

The final shape must be confirmed in a future preflight, but the planning assumption is:

- provider: Azure Cosmos DB;
- API: NoSQL/Core SQL API unless a later approval changes it;
- logical database: one Pumpkin CMS production database;
- tenant/site partitioning: tenant-aware, with Ice scoped by tenant/site keys;
- containers: either existing model-aligned containers or a documented consolidated container strategy;
- backup policy: continuous or periodic based on owner risk/cost decision.

## Readiness Outcomes

| Outcome | Meaning |
| --- | --- |
| `existing-cosmos-source` | Cosmos already exists and can be verified read-only. |
| `missing-source-cosmos-target` | No DB exists; Cosmos is selected as target. |
| `scope-invisible` | Owner says Cosmos exists but current identity cannot see it. |
| `mismatch` | Owner scope and discovered metadata disagree. |
| `blocked` | Required non-secret scope or auth is missing. |

## Hard Stop

No Cosmos account, database, container, role assignment, network rule, backup policy, or setting is created in this phase.
