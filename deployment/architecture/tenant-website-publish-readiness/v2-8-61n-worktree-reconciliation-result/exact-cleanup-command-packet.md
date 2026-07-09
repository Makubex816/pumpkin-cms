# Exact Cleanup Command Packet

Status: generated only. No command in this file was executed during V2.8.61N.

Review the owner decision template before running any cleanup:

`.tmp/v2-8-61n/owner-decisions/worktree-cleanup-owner-decisions.json`

## Decision A: Delete Reproducible Cache/Build Outputs

Run only after owner approval.

```powershell
# V2.8.61N approved cleanup candidate: Admin UI Next build cache
if (Test-Path -LiteralPath "apps/admin/.next") {
  Remove-Item -LiteralPath "apps/admin/.next" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Admin UI dependency cache
if (Test-Path -LiteralPath "apps/admin/node_modules") {
  Remove-Item -LiteralPath "apps/admin/node_modules" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Admin UI TypeScript build info
if (Test-Path -LiteralPath "apps/admin/tsconfig.tsbuildinfo") {
  Remove-Item -LiteralPath "apps/admin/tsconfig.tsbuildinfo" -Force
}

# V2.8.61N approved cleanup candidate: Ice web dependency cache
if (Test-Path -LiteralPath "apps/ice-rink-web/node_modules") {
  Remove-Item -LiteralPath "apps/ice-rink-web/node_modules" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Ice web TypeScript build info
if (Test-Path -LiteralPath "apps/ice-rink-web/tsconfig.tsbuildinfo") {
  Remove-Item -LiteralPath "apps/ice-rink-web/tsconfig.tsbuildinfo" -Force
}

# V2.8.61N approved cleanup candidate: Pumpkin API build output
if (Test-Path -LiteralPath "apps/pumpkin-api/bin") {
  Remove-Item -LiteralPath "apps/pumpkin-api/bin" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Pumpkin API obj output
if (Test-Path -LiteralPath "apps/pumpkin-api/obj") {
  Remove-Item -LiteralPath "apps/pumpkin-api/obj" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Pumpkin API tests build output
if (Test-Path -LiteralPath "apps/pumpkin-api.Tests/bin") {
  Remove-Item -LiteralPath "apps/pumpkin-api.Tests/bin" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: Pumpkin API tests obj output
if (Test-Path -LiteralPath "apps/pumpkin-api.Tests/obj") {
  Remove-Item -LiteralPath "apps/pumpkin-api.Tests/obj" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: package dependency cache
if (Test-Path -LiteralPath "packages/pumpkin-ts-models/node_modules") {
  Remove-Item -LiteralPath "packages/pumpkin-ts-models/node_modules" -Recurse -Force
}

# V2.8.61N approved cleanup candidate: browser/proof runner output
if (Test-Path -LiteralPath "test-results") {
  Remove-Item -LiteralPath "test-results" -Recurse -Force
}
```

## Decision B: Archive Content-Review Artifacts Outside Repo

Run only after owner approval.

```powershell
# V2.8.61N archive candidate: Ice final contact content-review package
$archiveRoot = "C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\archived-content-review"
if (-not (Test-Path -LiteralPath $archiveRoot)) {
  New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null
}
if (Test-Path -LiteralPath "content-review/ice-final-contact-input") {
  Move-Item -LiteralPath "content-review/ice-final-contact-input" -Destination (Join-Path $archiveRoot "ice-final-contact-input") -Force
}

# V2.8.61N archive candidate: Ice service areas content-review package
$archiveRoot = "C:\Users\User\Desktop\PumpkinCMS\tenant-onboarding-intake\archived-content-review"
if (-not (Test-Path -LiteralPath $archiveRoot)) {
  New-Item -ItemType Directory -Force -Path $archiveRoot | Out-Null
}
if (Test-Path -LiteralPath "content-review/ice-service-areas-input") {
  Move-Item -LiteralPath "content-review/ice-service-areas-input" -Destination (Join-Path $archiveRoot "ice-service-areas-input") -Force
}
```

## Decision C: Optional Gitignore Update

Run only after owner approval.

```powershell
# Review and then manually add these lines to .gitignore if approved:
# content-review/
# test-results/
```

## Commands Intentionally Not Provided

- No `git clean -fdx`.
- No `git reset --hard`.
- No broad `.tmp` deletion.
- No broad protected-folder deletion.
- No wildcard deletion under protected paths.
