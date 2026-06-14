# Evidence Binding Schema

V2.9.2 source of truth: `src/audit-job-ledger-schema.mjs`.

Required fields:

- `evidenceId`
- `evidenceType`
- `sourceRef`
- `safePath`
- `summary`

Supported evidence types:

- `root_report`
- `result_package`
- `production_artifact_hash`
- `deployment_record`
- `route_check_summary`
- `contact_form_verification_summary`
- `indexing_deferral_record`
- `runtime_qa_summary`
- `resource_registry_summary`
- `provider_profile_summary`
- `olm_publish_gate_summary`
- `backup_evidence_summary`
- `rollback_abort_plan`
- `next_phase_prompt`
- `source_of_truth_doc`
- `canonical_index_doc`

Safety rules:

- `safePath` must be repo-relative.
- `safePath` must not traverse directories.
- `safePath` must not reference protected config, credential, cookie, auth, token, secret, private-key, or key-vault-like paths.
- `production_artifact_hash` evidence must include `artifactHash` as lowercase SHA-256.
