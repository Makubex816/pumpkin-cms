# Serialization Source Diagnosis

The stale local media strings were not coming from active rendered page media.

Root cause:

- `apps/ice-rink-web/scripts/snapshot-cms-content.mjs` wrote full CMS page JSON into `.static-content-snapshots/ice-rink-rentals/pages/*.json`.
- Those full page JSON files included `revision.latestSnapshot`, an admin rollback snapshot of the pre-repair page state.
- Static public route modules loaded the page from the local snapshot and passed the full `page` object to public components.
- `apps/ice-rink-web/src/components/PageRenderer.tsx` is a client component, so the full `page` prop was serialized into public static HTML/RSC payloads.

Public runtime need:

- Public page rendering uses active page content, metadata, media, workflow, and normal page fields.
- No public source path needed `revision.latestSnapshot` for rendering.
- `latestSnapshot` is admin/rollback data, not public page content.

Validator behavior:

- The strict validators were correct to fail because the local media strings were present in deployable public artifacts.
- The fix should remove the non-public rollback payload from the public artifact rather than weakening validators or hiding active media errors.

Selected repair:

- omit `revision.latestSnapshot` from Ice public static snapshot pages before writing public static artifacts
- keep the `revision` object itself, including non-payload revision metadata
- do not write CMS records or stale CMS revisions

