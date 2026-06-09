# Module Boundaries

## Foundation Modules

| Module | Responsibility | Must not do |
| --- | --- | --- |
| `backup-scope-resolver` | resolve tenant/platform scope from safe input | read env secrets or call CMS |
| `backup-manifest-writer` | write manifest JSON from planned file entries | include secret values |
| `checksum-writer` | compute SHA-256 for bundle files | hash files outside approved bundle |
| `standard-bundle-writer` | create folder-based standard bundle | create zip in Phase 2F-3 |
| `cms-content-exporter` | export safe local/docs evidence first, later CMS content adapter | perform CMS writes |
| `database-export-planner` | write metadata/planned export placeholder | run database export |
| `media-inventory-exporter` | write metadata/inventory placeholders first | copy blobs or use signed URLs |
| `static-evidence-exporter` | collect safe local static evidence files | run static generation |
| `config-inventory-redactor` | write names and PRESENT/MISSING/REDACTED only | read protected config values |
| `backup-validator` | validate manifest, checksums, required files, redaction | mutate artifacts |
| `restore-plan-validator` | generate dry-run restore plan and checks | restore data |
| `artifact-expiration-planner` | calculate retention and expiry metadata | delete artifacts in first prototype |
| `audit-log-writer` | write local redacted audit events | log secret values |

## Escrow Modules

| Module | Responsibility | Phase |
| --- | --- | --- |
| `escrow-secret-catalog` | define allowlisted categories and exclusions | 2F-3 model/hard stop, 2F-5 active |
| `escrow-policy-validator` | require approval, recipients, categories, and fake-secret mode first | 2F-3 model/hard stop, 2F-5 active |
| `escrow-encryptor-interface` | define encrypt/decrypt interface with fake fixture tests first | 2F-3 interface, 2F-5 implementation |
| `escrow-manifest-writer` | write escrow manifest only for approved escrow mode | 2F-5 |
| `escrow-validator` | prove payload is encrypted and no plaintext leaks | 2F-5 |

## Wrapper Modules

| Wrapper | Role | Phase |
| --- | --- | --- |
| `cli-entrypoint` | local operator commands | 2F-3 |
| future API controller | admin HTTP endpoints and job creation | 2F-7 |
| future UI components | Backup Center screens | 2F-7 |

## Boundary Rule

Exporter modules produce local files only. Validators read local files only. API/UI modules are wrappers around already-proven local foundation behavior.
