# Backup Boundary Check

| Check | Result |
| --- | --- |
| Repo root | `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms` |
| Backup zip | `C:\Users\User\Desktop\PumpkinCMS\backup-inspection\source\Ice CMS BCKP.zip` |
| Backup zip exists | yes |
| Backup zip outside repo | yes |
| Inspection root | `C:\Users\User\Desktop\PumpkinCMS\backup-inspection` |
| Inspection root outside repo | yes |
| Backup copied into repo | no |
| Backup files staged | no |
| Suspected secret file contents inspected | no |

Filename-only sensitive candidates in the zip:

- `config-inventory/`
- `config-inventory/CONFIG_VALUES_REDACTED.md`
- `config-inventory/env-inventory.redacted.json`

Those files were not parsed or printed.

