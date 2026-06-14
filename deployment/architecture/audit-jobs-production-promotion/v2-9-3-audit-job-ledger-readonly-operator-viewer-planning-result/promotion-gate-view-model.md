# Promotion Gate View Model

Promotion gate rows are derived from `ledger.promotionGates`.

## Fields

- `id`
- `type`
- `state`
- `result`
- `blockers`
- `requiredEvidence`
- `actualEvidence`
- `missingEvidenceRefs`
- `approvalReference`
- `rollbackPlanId`
- `evidenceSummaries`

## Purpose

The promotion gate panel shows whether each gate is complete, blocked, deferred, or missing evidence.

## Combined Fixture

The combined fixture exposes 11 promotion gates with zero blocked gates and zero missing evidence refs.
