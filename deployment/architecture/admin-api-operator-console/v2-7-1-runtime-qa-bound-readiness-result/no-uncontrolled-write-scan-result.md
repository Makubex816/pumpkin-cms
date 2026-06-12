# No-Uncontrolled-Write Scan Result

Status: `passed`

Runtime QA source scan:

- Name: `runtime-qa-admin-api-operator-console-source`
- Scanned files: `51`
- Matches: `0`

Roots scanned:

- `apps/admin/src/app/dashboard/outbound-links`
- `apps/admin/src/components/outbound-links`
- `apps/admin/src/lib/outbound-links`
- `apps/pumpkin-api/Services/OutboundLinks`
- `deployment/architecture/runtime-qa/platform-runtime-qa-harness/src`

The scan did not find uncontrolled `POST`, `PUT`, `PATCH`, `DELETE`, disallowed Azure mutation command patterns, or protected config path references in the checked source roots.
