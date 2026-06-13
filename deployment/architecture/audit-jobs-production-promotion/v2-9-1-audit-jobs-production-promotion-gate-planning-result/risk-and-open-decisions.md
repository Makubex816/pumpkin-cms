# Risk And Open Decisions

Result: complete.

Open decisions:

| Decision | Current recommendation |
| --- | --- |
| Ledger storage location | Keep V2.9.2 local and ignored or result-package-only until schema validation is proven |
| Source validator timing | Add in V2.9.2 as a no-write local validator with fixtures |
| Dashboard implementation timing | Plan after ledger validator has stable fixture outputs |
| Indexing future | Keep deferred outside V2.9.1 and do not resume without explicit approval |
| Backup waiver rule | Require explicit waiver text if backup evidence is unavailable for a future promotion |
| Contact-form verification repeats | Do not repeat without a future one-action approval |

Risks:

- Audit/job records can become noisy unless IDs and evidence refs are enforced by a validator.
- Future operators could confuse `deferred` with `approved`; dashboard copy must distinguish those states.
- Route checks, contact POSTs, deployments, DNS changes, and indexing tools require strict one-action approval boundaries.
- Protected config and token boundaries must remain outside audit/job payloads.

