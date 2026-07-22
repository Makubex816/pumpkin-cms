# Root npm workspace and lockfile result

Result: passed.

Workspace members:

- apps/starter-app
- packages/pumpkin-ts-models
- packages/pumpkin-block-views

Root package-lock normalized SHA-256: `c0f981d52b70ca72f8f07f1e4f8f5cd05e58997ab9e4ddad0995a0c90a799d86`.

Clean Windows checkout raw lockfile SHA-256 before and after `npm ci`: `0ecce56a206652b7cdebaef73b67e4f5cebc3bfff4c010e84bc66bd7e4e59e22`.

Two clean roots passed `npm ci --ignore-scripts` and `npm run ci:root`. The root workspace replaces the prior package-copy/junction style proof lane.
