# Proposed Package Locations

## Phase 2H-3 Local Implementation

Recommended:

```text
deployment/architecture/outbound-link-manager/local-implementation/
  package.json
  fixtures/
  src/
  test/
  .tmp/
```

Purpose:

- local/offline scanner;
- schema-backed validators;
- registry and instance proposal writer;
- fixture-driven tests;
- no live CMS/API calls;
- no writes outside ignored `.tmp`.

## Shared Schemas

Existing architecture schemas remain at:

```text
deployment/architecture/outbound-link-manager/schemas/
```

Phase 2H-3 should consume these as contract inputs before any generated runtime types exist.

## Future Pumpkin API Boundaries

Future C# implementation should live under:

```text
apps/pumpkin-api/Models/OutboundLinks/
apps/pumpkin-api/Services/OutboundLinks/
apps/pumpkin-api/Managers/OutboundLinkManager.cs
```

No API implementation is approved in 2H-2.

## Future Admin Boundaries

Future Admin implementation should live under:

```text
apps/admin/src/app/dashboard/outbound-links/
apps/admin/src/lib/outbound-links.ts
apps/admin/src/components/outbound-links/
```

No Admin implementation is approved in 2H-2.

## Future Renderer Boundaries

Future public rendering integration should live near:

```text
apps/ice-rink-web/src/lib/outbound-links.ts
apps/ice-rink-web/src/components/OutboundLink.tsx
apps/ice-rink-web/src/components/PageRenderer.tsx
```

`PageRenderer.tsx` is already modified by unrelated work and must not be touched in planning phases.

## Backup Center Boundaries

Future backup integration should extend:

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/
```

Add outbound link exports only after local contracts pass and a separate Backup Center integration approval exists.
