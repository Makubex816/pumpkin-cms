# Current Build Divergence Map

Classification: `current_build_is_additive_but_not_tenant_expansion_ready`

Additions over external reference:

- Health endpoints.
- Auth verify/logout.
- Provider metadata.
- Page import/export/delete/rollback.
- MediaAsset registry and upload/archive/restore/replace/delete routes.
- PublishRun and ImportRun registries.
- Expanded Page, FormDefinition, FormEntry, Theme models.
- Static contact managed API production bridge.
- Tenant onboarding package contract.
- Backup package and restore dry-run proof.
- Later read-only/prototype Admin modules.

Breaking-risk divergences:

- Missing external submit route.
- Missing external admin FormEntry aliases.
- Ice/Roller-specific static/publish/provider hard-coding.
- Provider metadata container naming mismatch against source data access.

Conclusion:

The current build should continue as an additive compatibility layer, not a replacement of the external repo contract.
