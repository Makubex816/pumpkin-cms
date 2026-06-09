# Plugin and Extension Audit

## Strengths

- The design rejects arbitrary code drop-ins.
- Manifest schema requires permissions, tenant scope, migrations, tests, rollback, and security review.
- Marketplace is explicitly future work.
- Tenant scope and paused tenant risks are called out.

## Gaps Found

| Gap | Severity | Recommended fix | Status |
| --- | --- | --- | --- |
| Manifest spec did not ask core review questions | P1 | Add review questions for scope, permissions, migrations, tests, env vars, and security review. | applied |
| Permission strings are free-form | P2 | Define a formal permission enum before implementation. | recommended |
| Migration object shape is free-form | P2 | Add migration schema before extension implementation. | recommended |
| No extension fixture examples | P2 | Add example extension manifests in Phase 5. | recommended |
| No signing/provenance model for private packs | P3 | Design before marketplace or cross-team distribution. | recommended |

## Plugin Author Verdict

The extension design is directionally safe, but a plugin author would need a stricter manifest reference and examples before building a real extension pack.
