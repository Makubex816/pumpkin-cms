# Package Compiler Tool Result

Status: implemented.

Tool:

`deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs`

The CLI accepts:

- `--analysis`
- `--out`
- `--tenant-id`
- `--tenant-name`
- `--domain`
- `--www-domain`
- optional source ZIP, accepted package, media public base, media container, production default host, rendering mode, expected form type, and overlay paths.

Behavior:

- Reads analyzer proof JSON.
- Does not execute uploaded package scripts.
- Does not install or build package dependencies.
- Creates a normalized package candidate under the requested outside-repo output folder.
- Generates owner and technical reports.
- Preserves route classifications instead of silently dropping routes.
