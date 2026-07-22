
# Entry gate and clean-room environment

UP-20 carryforward was accepted from commit `9d8f552e142bb73e4ada3690e6f717068ebd0078`; the A04 authority commit is `8f4bcc937e74161ff911d0890dae84c1c12904bc`.

The qualification used two independent extracted clean-room roots and one bundle clone:

- Run 1: `program-management/upstream-intake/UP-30-A01/clean-room/run1/SDI-AI-pumpkin-cms-fda4611f6ca5`
- Run 2: `program-management/upstream-intake/UP-30-A01/clean-room/run2/SDI-AI-pumpkin-cms-fda4611f6ca5`
- Bundle clone: `program-management/upstream-intake/UP-30-A01/bundle-check/repo`

Host summary:

- Platform: win32 10.0.26200 x64
- Node: v24.14.0
- Time zone: America/New_York

Environment command evidence:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| git version | pass | 0 | 34 | `program-management/upstream-intake/UP-30-A01/logs/01_git_version.log` |
| dotnet list sdks | pass | 0 | 11 | `program-management/upstream-intake/UP-30-A01/logs/02_dotnet_list_sdks.log` |
| dotnet version default run1 | fail | 2147516571 | 10 | `program-management/upstream-intake/UP-30-A01/logs/03_dotnet_version_default_run1.log` |
| dotnet version roll-forward run1 | fail | 2147516571 | 9 | `program-management/upstream-intake/UP-30-A01/logs/04_dotnet_version_roll-forward_run1.log` |
| npm version | fail |  | 0 | `program-management/upstream-intake/UP-30-A01/logs/05_npm_version.log` |
| node version | pass | 0 | 24 | `program-management/upstream-intake/UP-30-A01/logs/06_node_version.log` |

Safety boundary: no remote fetch, merge, cherry-pick, rebase, downstream product source edit, push, deployment, live Azure operation, indexing activation, payment activation, CAPTCHA activation, or visual-editor activation was performed.
