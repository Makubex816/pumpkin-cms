# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Credential value accidentally committed | High | Strict committable/never-committable rules and value scans |
| Resource exists but is not mapped to tenant | Medium | Registry validation for orphaned resources |
| Credential reference exists but owner cannot locate value | Medium | Future vault readiness status and owner checklist |
| Vault generated without approval | High | Approval record required before creation |
| Encrypted vault staged to Git | High | Ignored output only and path validation |
| Runtime profile implies live readiness too early | High | Runtime guards and registry status gates |
| Build handoff credentials never rotated | High | Rotation/cleanup tasks required in handoff package |
| Admin/Electron exposes sensitive values | High | Redacted API contracts and local-only vault handling |

