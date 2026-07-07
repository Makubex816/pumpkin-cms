# Starter Dependency Lockfile Result

Status: resolved.

Initial state:

- `apps/starter-app/package.json`: present.
- `apps/starter-app/package-lock.json`: absent.
- `apps/starter-app/node_modules`: absent.
- package lifecycle scripts: none found in starter or local package dependency manifests.

Commands:

- `npm install --package-lock-only --ignore-scripts`: pass.
- `npm ci --ignore-scripts`: pass.

Result:

- `apps/starter-app/package-lock.json` generated.
- npm audit summary reported 5 findings: 1 moderate, 4 high.
- No dependency remediation command was run.
- `node_modules` removed after proof.

Git note:

- root `.gitignore` ignores `apps/**/package-lock.json`, so committing the starter lockfile requires exact `git add -f -- "apps/starter-app/package-lock.json"`.
