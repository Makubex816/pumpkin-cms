# Escrow Approval Workflow

## Creation Approval

Escrow creation requires:

- recovery escrow mode selected;
- scope selected: tenant or full platform;
- reason entered;
- secret categories selected from allowlist;
- excluded categories displayed;
- recipient public keys selected;
- expiry/retention selected;
- elevated approver signoff;
- audit record created before payload generation.

## UI Warning

The UI should warn:

> Recovery escrow can contain encrypted runtime secrets. Use standard backup unless you are preparing for recovery. Escrow creation is audited and requires separate restore approval before any secret can be restored.

## CLI Warning

The CLI should require explicit flags, such as `--mode recovery-escrow`, `--reason`, `--recipient`, and an approval reference. It should refuse ambiguous commands.

## Abort Conditions

Abort escrow creation if:

- a requested category is not allowlisted;
- recipient keys are missing or expired;
- approval is missing;
- output path is public/static/git-tracked;
- validation finds plaintext secret material in logs or standard manifest fields.
