# QA Scope

Approved scope:

- Review Phase 2F-13 result package and Backup Generator docs.
- Run full Backup Center check suite.
- Run local/fake generator QA.
- Run Ice live-readonly generator QA if safe read-only access remains available.
- Run explicit backup validator checks.
- Run explicit restore-plan checks.
- Run explicit download package checks.
- Verify generated artifacts are ignored and unstaged.
- Review operator runbook and generated retention/cleanup guidance.
- Create owner signoff checklist.
- Create Outbound Link Manager transition gate.

Not approved:

- No new Backup Generator feature implementation.
- No CMS runtime switch.
- No CMS writes.
- No MediaAsset writes.
- No Cosmos writes.
- No storage mutation.
- No Azure mutation.
- No keys/listKeys.
- No connection strings.
- No SAS generation.
- No protected config reads.
- No secret export.
- No encrypted escrow execution.
- No deployment, DNS, Cloudflare, Function App setting, Search Console, indexing, or live-page publication changes.

Worktree note:

The worktree was already busy at start state. Phase 2F-13 source/result files were already staged and were left untouched. Phase 2F-14 generated outputs were written only under ignored `.tmp`; Phase 2F-14 result files were created as normal source docs and were not staged by this pass.
