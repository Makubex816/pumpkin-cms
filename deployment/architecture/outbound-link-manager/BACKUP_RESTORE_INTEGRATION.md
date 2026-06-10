# Backup Restore Integration

Outbound Link Manager must be backup-aware from the start.

## Standard Backup Files

Future standard backups should include:

- `cms-content/outbound-links.json`
- `cms-content/outbound-link-instances.json`
- `cms-content/outbound-link-policies.json`
- `cms-content/outbound-link-scan-runs.json`
- `cms-content/outbound-link-audit-summary.json`

## Backup Manifest

The backup manifest should record:

- link count;
- instance count;
- domain count;
- disabled link count;
- disabled instance count;
- pending review count;
- policy version;
- scan summary count;
- audit export policy.

## Restore Validation

Restore validation should check:

- link count;
- instance count;
- domain count;
- disabled link state;
- disabled instance state;
- tenant policy state;
- rendering fallback state;
- stale instance count;
- pending review count.

## Restore Safety

Restore planning must not automatically re-enable disabled links. Disabled global links and disabled instances are governance state and must survive restore unless a separate owner-approved restore policy says otherwise.

## Backup Center Dependency

Phase 2F Backup Generator provides the safety layer. Outbound Link Manager should extend that bundle contract, not bypass it.
