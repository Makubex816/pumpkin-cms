# Future Command Structure

These are command structures for later approvals. Only the offline validator command maps to an existing local tool. CMS read-only and CMS import commands are placeholders for a future importer and must not be treated as implemented commands unless that tool exists and has been separately approved.

## Variables Used In Examples

```powershell
$repoRoot = "C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms"
$packagePath = "deployment/architecture/multi-tenant-onboarding-system/import-package-builder/.tmp/real-dry-run-roller-rink-rentals"
$validatorOut = "deployment/architecture/multi-tenant-onboarding-system/validator-implementation/.tmp/roller-pre-import-validation"
$preflightOut = "deployment/architecture/multi-tenant-onboarding-system/.tmp/roller-cms-readonly-preflight"
$executionOut = "deployment/architecture/multi-tenant-onboarding-system/.tmp/roller-cms-import-execution"
```

These paths are examples for future commands. `.tmp` output is generated evidence and must not be staged unless a later evidence-packaging approval says so.

## Future Env Presence Check

Run only after separate read-only preflight approval:

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

## Existing Offline Validator Command

Run only after separate read-only preflight approval:

```powershell
Push-Location "C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms\deployment\architecture\multi-tenant-onboarding-system\validator-implementation"
node src/cli.mjs --package "..\import-package-builder\.tmp\real-dry-run-roller-rink-rentals" --out ".tmp\roller-pre-import-validation" --support-packet
Pop-Location
```

Expected result before continuing: validator status `passed`, errors `0`, warnings `0`, and no external checks.

## Future CMS Read-Only Preflight Placeholder

This command is not known to exist today. It is the required shape for a future read-only CMS preflight tool.

```powershell
node "<future-cms-importer-cli>" `
  --tenant "roller-rink-rentals" `
  --package "$packagePath" `
  --mode "read-only-preflight" `
  --env-presence-only `
  --no-write `
  --no-mediaasset-write `
  --no-external-checks `
  --out "$preflightOut"
```

Required behavior:

- print no secrets
- perform no writes
- query only approved CMS read-only state
- report conflicts before any import execution approval
- produce redacted evidence

## Future CMS Import Execution Placeholder

This command is not approved now. It must only run after a later explicit CMS import execution approval and after read-only preflight evidence passes.

```powershell
node "<future-cms-importer-cli>" `
  --tenant "roller-rink-rentals" `
  --package "$packagePath" `
  --scope "draft-preview" `
  --mode "execute-cms-import" `
  --approval-id "<approved-cms-import-execution-approval-id>" `
  --rollback-owner "<approved-rollback-owner>" `
  --capture-created-ids `
  --no-live-pages `
  --no-static-generation `
  --no-deployment `
  --no-mediaasset-write `
  --no-external-checks `
  --out "$executionOut"
```

Required behavior:

- default to no-write unless execution mode and approval ID are present
- stop before static generation, deployment, and live pages
- capture all created or updated CMS IDs
- produce redacted evidence
- avoid unrelated tenants

## Commands That Remain Forbidden

Do not run commands that:

- publish or deploy the site
- upload media binaries or create MediaAsset records
- change DNS, Azure, Cloudflare, or Function App settings
- send email or modify Microsoft 365
- submit sitemaps, request indexing, or use Search Console
- run external HTTP checks
- print full environment variables
