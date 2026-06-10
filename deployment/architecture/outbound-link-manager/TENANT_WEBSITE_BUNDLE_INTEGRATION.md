# Tenant Website Bundle Integration

Tenant website bundles should eventually carry outbound link governance files beside page and media data.

Proposed path:

```text
tenants/{tenantKey}/sites/{siteKey}/outbound-links/
  outbound-links.json
  outbound-link-instances.json
  outbound-link-policy.json
  outbound-link-scan-runs.json
  outbound-link-validation-report.md
```

## Bundle Rules

- Bundle outbound link files must be tenant/site scoped.
- Files must use normalized URLs for registry matching.
- Instances must reference deterministic page/block/field paths.
- Disabled state must be preserved.
- Policy state must be included.
- Scan reports must identify source mode: local, import-package, backup-bundle, or approved live-readonly.

## Static Output Relationship

Tenant bundles may feed static output. Static renderers must use the bundle outbound link state snapshot to decide whether a link renders as clickable, plain text, hidden, disabled state, or fallback.

## Backup Relationship

Backup Center may include these files directly or transform them into `cms-content/outbound-*.json` files. Either path must preserve counts and governance state for restore validation.
