# UP-20 recheck and freeze exact upstream source prompt

Precondition: use only after CUR-20-A04 corrected active Atlas package is reviewed and committed.

```text
TASK ID: UP-20 — Recheck and Freeze Exact Upstream Source

Inputs:
- Active Atlas version 3.1.0
- Active Atlas authority pointer: deployment/architecture/build-atlas/ACTIVE_ATLAS_AUTHORITY_POINTER.json
- Upstream repository: https://github.com/SDI-AI/pumpkin-cms
- Branch: main
- Latest A04 observation: fda4611f6ca5a6206e3e8d6254e3e41c3b50618e

Objective:
Re-read upstream main, detect movement, create exact immutable source-freeze plan, and do not qualify or merge code until later authorized.

Boundaries:
No Azure mutation, downstream mutation, deployment, tenant/user/form mutation, payment work, Airstrip public-runtime request, indexing action, branch, tag, merge, or push unless explicitly authorized.
```
