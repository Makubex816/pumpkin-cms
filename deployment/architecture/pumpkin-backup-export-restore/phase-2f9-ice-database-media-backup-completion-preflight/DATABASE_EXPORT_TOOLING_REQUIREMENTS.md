# Database Export Tooling Requirements

## Common Requirements

- Owner-approved database export mode.
- Presence-only env check before execution.
- Approved output root under ignored `.tmp` or approved private backup storage.
- Explicit retention and cleanup rule.
- Checksum generation for every database artifact or evidence file.
- No protected config reads.
- No secret values in logs, manifests, reports, or command output.

## Azure SQL Evidence Mode

Potential tooling:

- Azure CLI or portal evidence supplied by operator.
- Read-only Azure permission sufficient to view backup policy/status.

Required outputs:

- redacted backup policy/status evidence;
- capture timestamp;
- Azure resource identifiers only if approved and non-secret;
- no storage keys, access tokens, or connection strings.

## BACPAC Export Mode

Potential tooling:

- Azure SQL export job through approved Azure tooling;
- `sqlpackage` export, if installed and approved;
- private storage container or ignored local output.

Required outputs:

- `.bacpac` or equivalent export artifact;
- encryption metadata or proof of encrypted storage;
- SHA-256 checksum;
- start/end timestamps;
- logical database identifier without connection string;
- restore validation preparation step.

## Local Tooling Checks

Future execution should check tool presence without exporting:

- `az` command, if Azure CLI mode is approved;
- `sqlpackage` command/path, if local export mode is approved;
- checksum utility or Node checksum writer;
- encryption utility, if local artifact encryption is approved;
- local output directory under ignored `.tmp`.

