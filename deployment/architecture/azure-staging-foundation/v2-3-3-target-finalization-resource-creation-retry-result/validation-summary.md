# Validation Summary

Checks run:

- result manifest JSON parse: passed
- JSON parse for changed JSON files: passed
- Bicep build validation: passed
- `git diff --check` on touched paths: passed with line-ending warnings only on existing top-level V2 docs
- secret-like value scan on new/changed docs/result package/root report: passed
- subscription ID redaction check on touched docs: passed
- protected/generated/raw artifact path guard: passed
- required-file presence check: passed
- no files staged: passed

Operational confirmations:

- protected config reads: no
- Key Vault secret queries: no
- keys/listKeys: no
- connection strings/SAS generated: no
- OLM staging write: no
- production DB migration or production write: no
- CMS write: no
- app deployment/indexing/live publication: no
- Azure staging resource creation: yes, approved V2.3.3 scope only
- Azure production resource creation: no
- RBAC assignment: no
