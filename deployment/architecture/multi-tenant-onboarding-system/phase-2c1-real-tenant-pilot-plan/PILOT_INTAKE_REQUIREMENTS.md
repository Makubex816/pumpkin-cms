# Pilot Intake Requirements

The pilot intake must be safe for docs, local files, support packets, and git.

## Intake Rules

- Collect only non-secret business information.
- Record who supplied each decision.
- Record whether the owner has approved each item or whether it is still pending.
- Use placeholders when the real value would expose a secret, token, private customer detail, or protected path.
- Keep legal/privacy, analytics, form oversight, monitoring, rollback, and indexing decisions explicit.
- Do not infer owner approval from technical readiness.

## Intake Flow

1. Identify the candidate business and owner.
2. Confirm the candidate meets the selection criteria.
3. Confirm the owner understands the forbidden-information list.
4. Gather the required user-supplied information.
5. Mark each value as `approved`, `pending`, `placeholder`, or `not_applicable`.
6. Have the operator convert approved intake into a future answers file only after the user approves the dry run.
7. Stop if any secret, private customer data, protected local path, or external-mutation request appears.

## Intake Evidence

The future dry-run evidence should include:

- the approved intake source path
- the generated answers file path
- the generated import package candidate path
- the validation report path
- the support packet path
- the owner review status
- the operator review status
- any unresolved risks or blockers

## Intake Status Values

- `approved`: owner has approved the value for dry-run package generation.
- `pending`: value is known to be needed but is not approved yet.
- `placeholder`: value is intentionally non-final for the dry run.
- `not_applicable`: field does not apply to the candidate.
- `blocked`: dry run must not proceed until resolved.
