# Package To Preview Parity Result

Status: passed.

The existing import-package builder and preview tests validate the Ice and Roller source fixtures against generated package previews.

Relevant command:

`npm test`

Result:

- Valid builder fixtures: `2`.
- Invalid builder fixtures: `12`.
- Generated package previews: `2`.
- Ice preview route count: `3`.
- Ice preview form config refs: `1`.
- Ice preview backup, registry, provider, runtime QA, OLM, and audit refs present.
- Roller preview import mode: `paused_no_import`.
- Roller preview future import readiness: `false`.
- Roller no-go condition includes `tenant_paused_no_import`.
