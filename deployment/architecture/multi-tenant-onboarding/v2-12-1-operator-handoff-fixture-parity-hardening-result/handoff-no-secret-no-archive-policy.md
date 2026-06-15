# Handoff No-Secret No-Archive Policy

Operator handoff packets are references-only artifacts.

Rules:

- Do not include secret values.
- Do not include protected config paths.
- Do not include deployment tokens, Google OAuth tokens, keys/listKeys output, connection strings, or SAS values.
- Do not create compressed handoff archives in the repo.
- Do not embed browser cookies, auth files, credential files, vault exports, or raw handoff artifacts.
- Do not stage `.tmp` outputs.
- Use deterministic references to existing result packages, fixtures, and read-only projections.

The validator enforces:

- `redactionPolicy.secretsPolicy = references_only_no_values`.
- `redactionPolicy.protectedConfigPolicy = do_not_reference_protected_paths`.
- `redactionPolicy.archivePolicy = no_compressed_handoff_archives_in_repo`.
- Blocked security flags remain `false`.
- Secret-like markers, protected-config markers, archive requests, and indexing requests fail validation.
