# Redirect Support Model Decision

Selected model: dedicated `TenantRedirect` records.

Each record belongs to one normalized tenant and stores canonical source/target values, explicit internal/external target kind, `301/302/307/308`, active state, query preservation, target resolution state, route precedence, page-shadow metadata, source evidence, import/audit correlations, timestamps, actors, soft-delete state, and audit events.

Why this is the smallest sufficient generic solution:

- It preserves nested route paths rather than flattening them into page slugs.
- It supports redirect semantics without altering page content or revision history.
- It gives Cosmos and Mongo a tenant-filtered uniqueness boundary.
- It exposes explicit validation before writes.
- It lets runtime resolution precede page rendering while recording any shadowed page.
- It remains reusable for every tenant; production source contains no Vegas, Party Pros, Ice, or Airstrip condition.

Source paths are immutable after creation because IDs are deterministic from tenant plus canonical source path. A source move requires deactivate plus create, preserving identity and audit clarity.
