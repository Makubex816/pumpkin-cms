# Isolated Preview Build Package Result

Result: passed.

Source:

- Owner-approved Airstrip ZIP was extracted into ignored `.tmp`.
- Build/package work happened only in the copied `.tmp` workspace.
- The original package source was not modified.

Validation:

- Tenant package validator: passed.
- Dependency install: passed.
- Type-check: passed.
- Initial production build found a dependency resolution issue in the copied workspace.
- Copied Next config was adjusted only under `.tmp` for standalone output and dependency resolution.
- Production build after copied-workspace adjustment: passed.
- Local standalone route smoke test: passed for `/`, `/request-booking`, `/packages`, and `/airstrip-the-club`.

Package:

- POSIX ZIP entries: passed.
- Root `server.js`: present.
- Next static assets: present.
- Public assets: present.
- Env/appsettings/local.settings files: absent.

Notes:

- Dependency install reported npm audit warnings in the source package dependency set. No dependency upgrade or source package change was performed in this phase.
