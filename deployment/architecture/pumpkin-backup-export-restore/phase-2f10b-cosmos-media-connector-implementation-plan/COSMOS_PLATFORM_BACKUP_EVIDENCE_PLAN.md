# Cosmos Platform Backup Evidence Plan

## Purpose

Cosmos platform backup evidence documents provider-native recoverability for the live database source without exporting documents or mutating resources.

## Future Evidence Fields

The evidence writer should capture:

- Subscription presence, not value, unless an approved non-secret display name is available.
- Cosmos account name after redaction review.
- Resource group name after redaction review.
- Database name after redaction review.
- Container names and partition-key paths.
- Backup policy mode if available.
- Backup interval and retention metadata if available.
- Continuous backup tier or restore capability if available.
- Read-only discovery timestamp.
- Tooling used.
- Operator approval reference.
- Any missing permission/tool/env blockers.

## Output Location

Execution output should live only under ignored `.tmp` backup output first, then be copied into a standard backup bundle only after validation confirms the content is secret-free.

Proposed bundle location:

```text
tenants/{tenantKey}/sites/{siteKey}/backups/database/platform-evidence/cosmos/
  cosmos-platform-backup-evidence.json
  cosmos-platform-backup-evidence.md
```

## Evidence Is Not Enough By Itself

Platform backup evidence alone does not make the backup portable. A production-restore-proof standard backup still needs tenant-scoped portable JSON export or a documented owner decision accepting a provider-native-only restore boundary.

## Redaction Rules

The evidence writer must never include:

- Account keys.
- Auth tokens.
- Connection strings.
- Cookies.
- User secrets.
- Protected config file contents.
- Full request or response headers.
