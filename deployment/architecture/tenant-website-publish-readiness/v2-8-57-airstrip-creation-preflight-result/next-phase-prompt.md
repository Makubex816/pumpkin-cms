# Next Phase Prompt

Approve V2.8.58 Airstrip Controlled Tenant Creation only.

Use completed V2.8.57 and the outside-repo operator handoff verified by SHA-256 in V2.8.57 to regenerate a new ignored secure file for V2.8.58.

Required V2.8.58 scope:

1. Reconfirm normalized package validator passes.
2. Reconfirm secure handoff hash matches.
3. Reconfirm SuperAdmin login and Airstrip absence.
4. Create only the Airstrip tenant, TenantAdmin, tenant credential binding metadata, brand/theme records, baseline pages, selected extra pages, FormDefinition `airstrip-reservation`, contact binding metadata, and MediaAsset metadata required by the normalized package.
5. Read back created records through authenticated Admin routes.
6. Stop before deploy, media upload, DNS/custom-domain mutation, indexing, contact POST, and form submission.
7. Produce V2.8.58 result package with rollback instructions.

Hard stops:

- Stop if Airstrip already exists before creation.
- Stop if package validator fails.
- Stop if secure handoff hash mismatches.
- Stop if any required secret value is missing.
- Stop before any deploy, DNS/custom-domain change, indexing action, contact POST, form submission, or binary media upload.

Do not print secret values. Do not stage `.tmp`, secure handoff, normalized package, binary media, or generated artifacts. Do not use `git add -A`.

