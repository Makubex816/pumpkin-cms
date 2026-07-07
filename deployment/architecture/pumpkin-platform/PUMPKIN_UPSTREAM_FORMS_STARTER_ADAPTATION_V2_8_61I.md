# Pumpkin Upstream Forms Starter Adaptation V2.8.61I

Status: adapted locally.

`apps/starter-app` is present as a local-only starter template. The embedded `/admin` is not a replacement for the production Admin UI.

Form adaptation result:

- Starter admin form definitions client accepts both `definitions` and `formDefinitions`.
- Starter form editor emits active FormDefinition metadata.
- `pumpkin-ts-models` exports upstream-compatible type names.
- `pumpkin-block-views` accepts string options and `{ value, label }` options.

Public form submit proof remains deferred. No contact POST or form submission occurred.
