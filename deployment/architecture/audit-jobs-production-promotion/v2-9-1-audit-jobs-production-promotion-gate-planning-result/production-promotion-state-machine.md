# Production Promotion State Machine

Result: complete.

Allowed states:

| State | Meaning | Allowed next states |
| --- | --- | --- |
| `draft` | Planning record exists but is not reviewed | `evidence_collecting`, `blocked` |
| `evidence_collecting` | Evidence paths and trace IDs are being assembled | `evidence_ready`, `blocked` |
| `evidence_ready` | Required evidence is present and locally valid | `operator_review`, `blocked` |
| `operator_review` | Owner/operator is reviewing gates | `approved_for_explicit_boundary`, `blocked`, `deferred` |
| `approved_for_explicit_boundary` | One exact future boundary is approved | `running`, `blocked`, `cancelled` |
| `running` | Approved one-action operation is in progress | `passed`, `failed`, `cancelled` |
| `passed` | Approved boundary passed and evidence is frozen | `complete`, `operator_review` |
| `failed` | Approved boundary failed and no broad retry is allowed | `blocked`, `operator_review` |
| `blocked` | Missing evidence or closed safety gate prevents action | `evidence_collecting`, `operator_review` |
| `deferred` | Future work is intentionally postponed | `operator_review` |
| `complete` | Scope complete and next gate generated | none |
| `cancelled` | Operator stopped the boundary | none |

Invalid transitions:

- Any transition from `draft`, `evidence_collecting`, or `operator_review` directly to live/write/deploy execution.
- Any transition to `running` without `approved_for_explicit_boundary`.
- Any retry transition after a one-action boundary unless a new explicit approval exists.
- Any transition that requires protected config reads, token use/printing, keys/listKeys, connection strings, SAS, DNS mutation, deployment, indexing, contact-form POST, CMS write, provider write, or Azure mutation without future explicit approval.

