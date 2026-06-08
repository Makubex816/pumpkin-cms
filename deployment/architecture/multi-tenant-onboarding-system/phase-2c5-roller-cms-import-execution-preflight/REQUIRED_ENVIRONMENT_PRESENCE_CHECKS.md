# Required Environment Presence Checks

Future CMS read-only preflight or import execution may require runtime environment variables. This package only defines presence checks. It does not read protected config files and does not print values.

## Likely Required Variables

| Variable | Purpose | Required For | Value Handling |
| --- | --- | --- | --- |
| `PUMPKIN_API_URL` | CMS/admin API base URL or CMS endpoint reference | read-only preflight and import execution | print only `PRESENT` or `MISSING` |
| `ROLLER_RINK_RENTALS_API_KEY` | runtime-only tenant/import credential if the future importer requires one | import execution only, if applicable | print only `PRESENT` or `MISSING` |
| `ROLLER_RINK_RENTALS_TENANT_ID` | existing tenant ID if a future read-only preflight finds or requires one | read-only preflight, if applicable | print only `PRESENT` or `MISSING` |
| `PUMPKIN_ADMIN_JWT` | authenticated admin API token if the future CMS import path uses admin API auth | read-only preflight and import execution, if applicable | print only `PRESENT` or `MISSING` |

## Presence-Only PowerShell Template

This template is for a later separately approved preflight. It must be run only from an operator shell where variables are already loaded. It prints names and presence status only.

```powershell
$requiredNames = @(
  "PUMPKIN_API_URL",
  "ROLLER_RINK_RENTALS_API_KEY",
  "ROLLER_RINK_RENTALS_TENANT_ID",
  "PUMPKIN_ADMIN_JWT"
)

foreach ($name in $requiredNames) {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    "$name=MISSING"
  } else {
    "$name=PRESENT"
  }
}
```

## Operator Rules

- Do not run `Get-ChildItem Env:` as evidence because it can print unrelated values.
- Do not print, paste, screenshot, commit, or include token values in support packets.
- Do not read `.env.local`, `appsettings.Development.json`, real `local.settings.json`, credential caches, token files, or protected config.
- Do not turn a missing variable into a guess. Mark it `MISSING` and stop before execution.
- A variable being `PRESENT` does not authorize CMS writes.

## Required Evidence Shape

The later evidence report should include a table only:

| Name | Status |
| --- | --- |
| `PUMPKIN_API_URL` | `PRESENT` or `MISSING` |
| `ROLLER_RINK_RENTALS_API_KEY` | `PRESENT` or `MISSING` |
| `ROLLER_RINK_RENTALS_TENANT_ID` | `PRESENT` or `MISSING` |
| `PUMPKIN_ADMIN_JWT` | `PRESENT` or `MISSING` |
