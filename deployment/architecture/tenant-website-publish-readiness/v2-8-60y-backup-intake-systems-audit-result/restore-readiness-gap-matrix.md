# Restore Readiness Gap Matrix

| Restore Area | Current State | Target State | Required Build |
| --- | --- | --- | --- |
| Structural validation | Local dry-run passes for proven bundles | Every backup validates before use | Promote validator to Backup Manager job |
| Checksum validation | Proven for protected Ice bundle | Required for every artifact | Service-side checksum runner |
| Database restore | No live restore adapter | Target-scoped dry-run and approved write adapter | Restore adapter design and tests |
| Identity restore | Partial/redacted | Controlled user reset/reseed or identity export/import | Identity recovery workflow |
| Secret restore | Excluded | Secure hardcopy reference and handoff gate | Secret reference schema and operator checklist |
| Media restore | Media copy proof exists | Controlled blob restore with overwrite policy | Media restore adapter and diff plan |
| FormEntry restore | Protected backup only | Explicit privacy-approved restore | PII restore policy |
| DomainBinding restore | Source model exists | Binding record restore plus DNS state review | DomainBinding restore mapping |
| Original package restore | Not standardized | Reattach original source package to tenant history | Source package registry |
| Normalized package restore | Summary only | Restore or regenerate normalized package | Package artifact registry |
| Overlay restore | Airstrip overlay exists separately | Reapply overlays during rebuild | Patch/overlay registry |
| Runtime artifact replay | Metadata-level only | Rebuild or replay approved deploy artifact | Artifact retention policy |
| Live no-regression | Manual GET proof | Automated post-restore GET matrix | Runtime QA integration |

Conclusion: backups are useful for audit and planning today, but live restore remains a controlled future build.

