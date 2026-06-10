# Rendering Integration Plan

No renderer implementation is approved in Phase 2H-2.

## Snapshot Contract

Before touching public renderer code, define an outbound link state snapshot:

```text
tenant/site
  links by normalized URL
  instances by location path
  policy
  generatedAt
```

The renderer consumes this snapshot and does not query Admin/API live at render time.

## Future Component Boundary

Suggested future component:

```text
apps/ice-rink-web/src/components/OutboundLink.tsx
```

Suggested future resolver:

```text
apps/ice-rink-web/src/lib/outbound-links.ts
```

## Rendering Tests

- active link and enabled instance renders anchor;
- disabled global link renders plain text by default;
- disabled instance overrides active global link;
- blocked domain renders non-clickable output;
- fallback behavior is deterministic in static export.

## Gate

Renderer integration should not begin until local scanner and snapshot output are validated.
