# Website File Export Requirements

Tenant backups must include the website recovery inputs, not only database records.

## Required File Domains

| File Domain | Required Behavior |
| --- | --- |
| Original uploaded package | Copy the original owner/partner ZIP or store an immutable outside-repo reference with checksum. |
| Normalized Pumpkin package | Copy the current normalized package directory or include an immutable checksum/reference. |
| Source patches/overlays | Copy scoped overlays such as Airstrip V2.8.60R responsive CSS patch and apply script. |
| Build/deploy metadata | Record deployment IDs, package hashes, runtime mode, build commands, and artifact paths when safe. |
| Build artifacts | Include files only when approved, safe, and not generated from protected config. |
| Public media source files | Copy approved media blobs and maintain a media manifest. |
| Runtime routes | Include expected routes and production proof matrix. |
| Domain binding packet | Include DomainBinding record, DNS packet, validation state, and owner action status. |
| Restore instructions | Generate a per-backup runbook with exact gaps and hard stops. |

## Airstrip-Specific Requirement

Airstrip backups must preserve:

- source ZIP checksum;
- normalized package path/checksum;
- hybrid Next server-required runtime decision;
- 13 media assets and blob mapping;
- 5 live public pages baseline plus additional routes;
- `airstrip-reservation` form definition mapping;
- V2.8.60R responsive overlay files;
- production default host and pending custom-domain state.

