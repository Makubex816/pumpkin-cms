# Diagnostics Reconciliation Decision

Default state: plan only.

V2.8.61K noted that diagnostic setting readback returned no rows for sampled resources, while earlier hardening history remains documented.

Owner decision:

- Do not mutate diagnostic settings by default.
- If the owner wants exact monitoring proof, approve a separate read-only reconciliation first.

Future phase:

- V2.8.61N Diagnostic settings reconciliation plan/proof.

Recommended V2.8.61N shape:

- Read-only diagnostic setting inventory.
- Compare current state against V2.8.45 hardening expectations.
- Classify gaps.
- Stop before mutation.
- Produce a separate approval packet if a repair is needed.

Blocked now:

- Diagnostic setting creation.
- Diagnostic setting update.
- Diagnostic setting deletion.
- Alert mutation.
- Workspace mutation.
