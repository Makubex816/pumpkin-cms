# Environment Presence Check Result

Presence checks were run against environment variables already present in the shell. No protected config files were read and no values were printed.

## Presence Result

| Variable | Status |
| --- | --- |
| `PUMPKIN_API_URL` | `MISSING` |
| `PUMPKIN_ADMIN_JWT` | `PRESENT` |
| `ROLLER_RINK_RENTALS_API_KEY` | `MISSING` |
| `ROLLER_RINK_RENTALS_TENANT_ID` | `MISSING` |

## Command Shape Used

```powershell
$requiredNames = @(
  "PUMPKIN_API_URL",
  "PUMPKIN_ADMIN_JWT",
  "ROLLER_RINK_RENTALS_API_KEY",
  "ROLLER_RINK_RENTALS_TENANT_ID"
)

foreach ($name in $requiredNames) {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    "{0}: MISSING" -f $name
  } else {
    "{0}: PRESENT" -f $name
  }
}
```

## Interpretation

- `PUMPKIN_ADMIN_JWT` is present, but it is not enough to run CMS read-only checks without `PUMPKIN_API_URL`.
- `PUMPKIN_API_URL` is required to choose the approved CMS/API target.
- `ROLLER_RINK_RENTALS_API_KEY` is missing, so public tenant-key GET checks are also not ready.
- `ROLLER_RINK_RENTALS_TENANT_ID` is missing. The expected tenant key from the local package remains `roller-rink-rentals`, but no runtime tenant ID was available from the shell.

## Result

Env presence ready: no.

Authenticated CMS/API read-only checks were skipped.
