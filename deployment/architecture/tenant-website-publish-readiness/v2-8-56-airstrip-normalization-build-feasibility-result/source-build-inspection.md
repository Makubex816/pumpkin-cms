# Source Build Inspection

Detected app: `apps/airstrip-frontend`

Framework and tooling:

| item | evidence |
| --- | --- |
| Framework | Next.js app router |
| Package manager | npm with `package-lock.json` |
| Main build script | `next build` |
| Local packages | `packages/pumpkin-block-views`, `packages/pumpkin-ts-models` |
| Static export config | Not configured in uploaded `next.config.js` |
| Dynamic routes | `/[...slug]`, `/sitemap.xml` |

Script inspection:

- `dev`, `build`, `start`, `lint`, and `type-check` are standard local app scripts.
- `seed` performs admin/API writes and was not run.
- Runtime env names are referenced by source, but no credential value was read, printed, or written.

Source-build caveat:

The upload does not include a root monorepo package file. The app-level install alone could not satisfy peer resolution for the local package output. A copied-workspace-only package dependency install was required before the source build passed.

