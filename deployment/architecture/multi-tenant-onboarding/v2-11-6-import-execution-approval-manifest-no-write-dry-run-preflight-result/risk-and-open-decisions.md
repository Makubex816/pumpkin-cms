# Risk And Open Decisions

Residual risks:

- No live target readback occurred, so future create/update/delete classification remains candidate mapping only.
- The future execution path still needs an explicit write-approved command boundary.
- Ice is dry-run eligible, but actual execution remains blocked by missing execution approval.
- Roller remains paused/no-import and cannot proceed without a separate resume approval.
- A pre-existing broader `import-runs` API route exists outside the V2.11 import-intake surface and should not be used for V2.11 import execution without separate review.

Open decisions:

- Whether V2.11.7 should execute the Ice import or perform one final approval review first.
- Whether future execution should be CLI-only or also expose a gated Admin control after execution proof.
- Which repo-supported readback method should be used before and after future execution.

