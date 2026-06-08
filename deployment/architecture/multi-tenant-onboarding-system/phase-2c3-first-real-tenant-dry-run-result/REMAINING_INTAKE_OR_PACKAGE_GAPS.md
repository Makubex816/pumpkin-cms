# Remaining Intake Or Package Gaps

## Blocking Gaps

- Tenant display name is missing.
- Tenant slug is missing.
- Primary domain is missing.
- `www` domain preference is missing.
- Media domain preference is missing.
- Approved routes are missing.
- Forbidden routes are missing.
- Deployment profile preference is missing.
- Contact form recipient reference is missing.
- Page copy source is missing.
- Images/media source and rights status are missing.
- Service areas are missing or not marked not applicable.
- Legal/privacy reviewer and status are missing.
- Analytics/tracking decision is missing.
- Owner contact is missing.
- Monitoring owner is missing.
- Rollback owner is missing.
- Final indexing owner is missing.
- Roller status confirmation is missing.

## Package Gaps

No package exists yet, so these checks remain pending:

- generated package structure
- route references
- media references
- form references
- SEO/canonical defaults
- validator report
- support packet
- operator handoff

## Exact Information Needed Next

Provide approved non-secret candidate intake with:

```text
Tenant display name:
Tenant slug:
Primary domain:
www preference:
Media domain preference:
Approved routes:
Forbidden routes:
Deployment profile preference:
Contact form leadRecipientRef:
Legacy recipientGroup, if needed:
Page copy source:
Images/media source:
Media rights status:
Service areas:
Legal/privacy reviewer:
Legal/privacy status:
Analytics/tracking decision:
Owner contact:
Monitoring owner:
Rollback owner:
Final indexing owner:
Roller status:
```

## Required Safety Confirmation

The next approval must confirm that the supplied intake contains no secrets, protected config, protected local paths, or private customer data.
