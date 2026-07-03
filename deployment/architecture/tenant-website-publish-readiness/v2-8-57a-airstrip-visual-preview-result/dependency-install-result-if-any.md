# Dependency Install Result

Dependency install occurred only inside the copied ignored workspace.

Commands used:

- `npm ci --ignore-scripts --no-audit --no-fund` in the copied app workspace.
- `npm install --ignore-scripts --no-audit --no-fund` in copied local package workspaces.
- `npm install --ignore-scripts --no-audit --no-fund --no-save playwright-core` in the copied app workspace for local screenshot capture.

Result:

| workspace | result |
| --- | --- |
| `apps/airstrip-frontend` | passed |
| `packages/pumpkin-block-views` | passed |
| `packages/pumpkin-ts-models` | passed |
| `playwright-core` local screenshot tooling | passed |

Lifecycle scripts remained disabled. The package `seed` script was inspected and not run.

