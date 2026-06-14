# Dry-Run Impact Analysis

Status: created.

Ice impact:

- Candidate route mappings: 3.
- Candidate content mappings: 4.
- Candidate media reference mappings: 1.
- Candidate form config mappings: 1.
- Registry/Profile/Backup/Runtime QA/OLM/Audit refs are present.
- Dry-run allowed.
- Actual future execution remains blocked by `execution_approval_not_granted`.

Roller impact:

- Candidate route mappings: 1 placeholder.
- Candidate content mappings: 2 placeholders.
- Candidate media/form mappings are paused placeholders.
- Registry/Profile/Backup/Runtime QA/OLM/Audit refs are paused placeholders.
- Dry-run blocked by `tenant_paused_no_import`.

No current-phase writes:

- `wouldWriteCms`: `false`.
- `wouldWriteProvider`: `false`.
- `wouldMutateAzure`: `false`.
- `wouldDeploy`: `false`.
- `wouldIndex`: `false`.

