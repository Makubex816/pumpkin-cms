# Config And Env Profile Model

## Rules

- Profiles are explicit.
- Presence checks print only PRESENT/MISSING.
- Protected config files are not read by default.
- Standard backup reports include names/status only.
- Secret values belong only to separately approved encrypted escrow, not this standard backup plan.

## Profiles

| Profile | Purpose | Allowed Reads | Writes |
| --- | --- | --- | --- |
| `local-dev` | offline development | repo source, safe docs, local generated ignored files | local generated ignored output only |
| `local-with-live-readonly` | CMS/API read-only export | process env presence, approved GET/HEAD endpoints | none |
| `azure-readonly-backup` | resource name/source discovery | Azure resource metadata names/location/status only | none |
| `azure-export-approved` | future DB/blob artifact execution | approved env/tooling and selected export/copy path | generated backup artifacts only |
| `production-write-approved` | future restore/import/deploy | separate elevated approval | out of scope |

## Presence Checks

Candidate DB/media connector profiles should check names such as:

- `PUMPKIN_API_URL`
- `PUMPKIN_ADMIN_JWT`
- `PUMPKIN_DATABASE_PROVIDER`
- `PUMPKIN_COSMOS_ACCOUNT_NAME`
- `PUMPKIN_COSMOS_DATABASE_NAME`
- `ICE_MEDIA_STORAGE_ACCOUNT`
- `ICE_MEDIA_CONTAINER`
- `ICE_MEDIA_PUBLIC_HOST`
- `ICE_MEDIA_BACKUP_OUTPUT_DIR`

Do not print values. Do not inspect protected config. Do not use appsetting commands that print values.

