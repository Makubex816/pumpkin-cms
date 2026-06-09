# Environment Presence Check Plan

## Rule

Future execution must run presence-only environment checks in the same terminal/session that launches Codex. Values must never be printed.

Allowed output format:

```text
NAME PRESENT
NAME MISSING
```

## Required CMS Presence Checks

Minimum required for future CMS read/export:

- `PUMPKIN_API_URL`
- `PUMPKIN_ADMIN_JWT`
- `ICE_RINK_RENTALS_API_KEY`
- `ICE_RINK_RENTALS_TENANT_ID`

## Database Export Presence Checks

Exact database export requirements depend on the later approved export mode. Candidate names for presence-only checks:

- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_SQL_SERVER_NAME`
- `AZURE_SQL_DATABASE_NAME`
- `AZURE_BACKUP_STORAGE_ACCOUNT`
- `AZURE_BACKUP_CONTAINER`
- `AZURE_CLIENT_ID`, if service principal auth is approved
- `AZURE_CLIENT_SECRET`, if service principal auth is approved

Connection strings and storage keys must not be printed and should not be read from protected files.

## Media Export Presence Checks

Candidate names for future media inventory/copy:

- `ICE_MEDIA_STORAGE_ACCOUNT`
- `ICE_MEDIA_CONTAINER`
- `ICE_MEDIA_PUBLIC_HOST`
- `AZURE_BACKUP_STORAGE_ACCOUNT`
- `AZURE_BACKUP_CONTAINER`

If future media export uses Azure identity, it should reuse the approved Azure presence checks without printing token values.

## Static Evidence Presence Checks

Candidate names for future static evidence generation/validation:

- `ICE_STATIC_OUTPUT_DIR`
- `ICE_STATIC_ARTIFACT_DIR`
- `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
- `STATIC_FORM_ENDPOINT_VERIFIED`

Endpoint URLs are public configuration but should still be reported as presence/status only in backup manifests unless the future approval explicitly allows public endpoint recording.

## Sample Future Presence-Only Check

```powershell
$names = @(
  'PUMPKIN_API_URL',
  'PUMPKIN_ADMIN_JWT',
  'ICE_RINK_RENTALS_API_KEY',
  'ICE_RINK_RENTALS_TENANT_ID'
)
foreach ($name in $names) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    "$name MISSING"
  } else {
    "$name PRESENT"
  }
}
```

## Phase 2F-7 Boundary

This package defines the presence plan only. It did not inspect environment variables.
