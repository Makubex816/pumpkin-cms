# Risk Register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Non-technical users paste secrets into intake | high | Clear warnings, field labels, secret scans, and runtime-only placeholders. |
| Tenant routes leak preview/obsolete pages | high | Mandatory route allowlist and forbidden route validators. |
| Public output exposes CMS review/admin payloads | high | Public payload sanitizer and hidden-string validators. |
| Media appears locally but fails in production | medium | Profile-specific media URL and HEAD validators. |
| Form delivery sends duplicate or unsafe messages | medium | Safe preflight checks, explicit valid-test approval, inbox confirmation, and rollback. |
| DNS rollback changes unrelated email/media records | high | Captured pre-cutover records and scoped rollback runbooks. |
| Analytics added without privacy review | medium | Separate analytics approval and legal/privacy checklist. |
| Extension packs become arbitrary code | high | Manifest schema, permission model, tenant scoping, review, and tests. |
| Search Console happens before owner review | high | Final hard-stop validator and explicit approval requirement. |
| Roller gets touched accidentally | high | Paused tenant status and tenant-scope validators. |

