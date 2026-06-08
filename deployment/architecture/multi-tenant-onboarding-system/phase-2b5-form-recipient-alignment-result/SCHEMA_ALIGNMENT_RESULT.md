# Schema Alignment Result

Updated:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-spec/schemas/form.schema.json
```

## Changes

- Added optional `leadRecipientRef`.
- Added optional legacy `recipientGroup`.
- Added optional `staticEndpointRef`.
- Added optional `domainRoutingKey`.
- Removed raw `recipient` from the required field list while keeping it allowed as optional legacy/display metadata.
- Kept `additionalProperties: false`.

## Safety Rules

`leadRecipientRef`, `recipientGroup`, and `domainRoutingKey` use safe lowercase reference IDs:

```text
^[a-z][a-z0-9-]{2,80}$
```

`staticEndpointRef` remains constrained to approved placeholder/profile-managed shapes.

## Compatibility

Packages may still include `recipient` as optional legacy/display metadata. New generated packages route through `leadRecipientRef` and mirror that value into `recipientGroup` for legacy compatibility.
