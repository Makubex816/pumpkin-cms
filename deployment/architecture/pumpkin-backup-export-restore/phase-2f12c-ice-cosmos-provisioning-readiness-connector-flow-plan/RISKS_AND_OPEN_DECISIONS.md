# Risks And Open Decisions

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Cosmos target is treated as already configured | False readiness | Keep `missing` and `selectedTargetProvider` as separate fields. |
| Provisioning happens before resolver proof | Wrong database/source | Require provider resolver and owner scope gates first. |
| CMS runtime wiring requires protected config values | Secret exposure | Use presence-only checks and secret-store/app-setting approval later. |
| Migration writes before rollback capture | Data loss | Require migration preflight and rollback plan. |
| Export runs before read-only verification | Incomplete or wrong backup | Block export until provider verification passes. |
| Local-dev profile is mistaken for live source | False production proof | Profile labels and validator checks must fail production proof. |

## Open Decisions

- Final Cosmos account/database/container naming.
- Cosmos region and backup policy mode.
- Managed identity versus secret-store approach.
- Whether local Cosmos emulator support is worth implementing before live readiness.
- Exact CMS seed/migration source of truth if no database exists.
- Which roles can approve each gate.
