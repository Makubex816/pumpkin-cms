# Dependency Install Result

Dependency installs were run only inside `.tmp/v2-8-56/source-build/` copied workspace with lifecycle scripts disabled.

Commands used:

- App workspace: `npm ci --ignore-scripts --no-audit --no-fund`
- Local package workspaces: `npm install --ignore-scripts --no-audit --no-fund`

Result:

| workspace | result |
| --- | --- |
| `apps/airstrip-frontend` | Passed; 389 packages added |
| `packages/pumpkin-block-views` | Passed |
| `packages/pumpkin-ts-models` | Passed |

Reason local package installs were needed:

The uploaded package lacks a root workspace install surface. The initial app build failed because the local `pumpkin-block-views` package could not resolve its peer dependency from the app-level `node_modules`.

