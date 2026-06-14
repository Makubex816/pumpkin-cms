# Import Package Taxonomy

Canonical V2.11 package types:

| Package type | Purpose | V2.11.1 execution state |
| --- | --- | --- |
| `tenant_bundle` | Whole-tenant governance package tying child references together. | Validate only |
| `website_content_bundle` | Page/content references and content source evidence. | Validate only |
| `route_content_manifest` | Route list, slugs, static/dynamic route rules, and route ownership. | Validate only |
| `media_manifest` | Media reference list, provenance, alt-text/readiness, and delivery profile. | Validate only |
| `form_configuration_reference` | Form endpoint/config reference without secret values or POST execution. | Validate only |
| `resource_registry_binding` | Resource Registry record references. | Validate only |
| `provider_profile_binding` | Provider Profile candidate/current binding references. | Validate only |
| `backup_center_evidence_bundle` | Backup/evidence references required before import execution. | Validate only |
| `runtime_qa_evidence_bundle` | Runtime QA prerequisites and validation references. | Validate only |
| `outbound_link_manager_bundle` | OLM validation and export/import carryforward. | Validate only |
| `audit_jobs_evidence_bundle` | Audit Jobs and promotion-gate references. | Validate only |

None of these package types authorizes runtime import execution in V2.11.1.
