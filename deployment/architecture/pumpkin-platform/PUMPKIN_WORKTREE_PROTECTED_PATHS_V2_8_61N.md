# Pumpkin Worktree Protected Paths V2.8.61N

Status: active.

Protected paths:

- `.tmp/`
- `secure-operator-handoff/`
- `C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\`
- `C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\`
- `C:\Users\User\Desktop\PumpkinCMS\visual-review\`
- `C:\Users\User\Desktop\PumpkinCMS\external-reference\`
- `C:\Users\User\Desktop\PumpkinCMS\tenant-backups\`
- `node_modules/`
- `.next/`
- `bin/`
- `obj/`
- `dist/` unless package dist is explicitly approved as source-controlled.
- `content-review/` until owner decides.
- `test-results/` until owner decides.

Rules:

- Do not sweep protected paths.
- Do not stage protected paths.
- Do not print secret-like contents.
- Do not use broad cleanup commands.
- Do not disturb Airstrip.
