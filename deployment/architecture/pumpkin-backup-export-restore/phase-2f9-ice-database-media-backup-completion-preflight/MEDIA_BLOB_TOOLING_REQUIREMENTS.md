# Media Blob Tooling Requirements

## Common Requirements

- Owner-approved media mode.
- Presence-only env check before execution.
- Approved source identity or read-only access method.
- Approved output root under ignored `.tmp` or approved private backup storage.
- Checksum generation for every copied blob.
- No signed URLs, storage keys, or SAS URLs in reports or manifests.
- No MediaAsset writes.

## Local Copy Mode

Potential tooling:

- Azure CLI storage blob commands;
- Azure Storage SDK through a local worker;
- approved HTTP GET from public media URLs only if separately approved.

Required outputs:

- media copy folder;
- blob-copy manifest;
- checksum file;
- copy result report;
- failed/missing asset report.

## Private Backup Storage Mode

Potential tooling:

- Azure storage account/container with private access;
- storage-side copy job;
- backup worker with read-only source and write-only target permissions where possible.

Required outputs:

- destination inventory;
- checksum or source hash proof;
- retention class;
- access-control proof without secret values.

## Tool Presence Checks

Future execution may check:

- Azure CLI presence;
- Node media backup worker presence;
- output directory safety;
- available disk space for local copy mode;
- package validator support for media-copy mode.

