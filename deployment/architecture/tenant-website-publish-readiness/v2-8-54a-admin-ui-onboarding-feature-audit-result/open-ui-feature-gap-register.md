# Open UI Feature Gap Register

| ID | Gap | Severity | Impact | Recommended Next Action |
| --- | --- | --- | --- | --- |
| UI-GAP-001 | `/dashboard/leads` route missing; current lead inbox is `/dashboard/forms` | medium | Prompt/operator language may not match actual route | Add route alias or update operator docs to canonical `/dashboard/forms` |
| UI-GAP-002 | No complete Admin UI real-tenant onboarding wizard | high | Tenant creation remains package/Codex/operator driven | Add read-only package intake wizard before creation writes |
| UI-GAP-003 | Tenant creation controls exist but are not package-aware | high | Risk of manual creation drift | Require package validator and secure-handoff preflight before enabling creation |
| UI-GAP-004 | External compatibility guardrails are doc/API based, not surfaced as UI checks | medium | Operators may miss hard-locked compatibility values | Add compatibility panel to onboarding review |
| UI-GAP-005 | DNS/indexing remain runbook-driven | medium | Correct boundary, but not visible in Admin UI | Add no-write launch checklist panel |
| UI-GAP-006 | Media package manifest and upload workflow are not one unified onboarding step | medium | Media upload still needs separate approval and careful staging | Add media manifest preview and missing-file report |
| UI-GAP-007 | Backup/restore readiness is not exposed in Admin UI | low | Operator must rely on durable docs | Link backup readiness docs from onboarding checklist |

None of these gaps required live mutation in V2.8.54A.

