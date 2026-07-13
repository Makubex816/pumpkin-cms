# Starter Preview Registry and Routing Result

The shared starter now discovers compiled package-static fixtures through a generated generic registry and resolves fixture redirects before page rendering.

## Routing

- All 43 routes map beneath `/preview/strip-club-near-me-vegas`.
- All internal route links are rewritten into the tenant preview namespace.
- One page-owned and two generic redirect contracts resolve before rendering with source status/query semantics.
- Preview responses receive `X-Robots-Tag: noindex, nofollow, noarchive`.
- Preview metadata suppresses public canonical emission; source canonical metadata remains audit data.
- No Vegas custom-host mapping or public starter navigation entry was added.
- Party Pros fixture semantics were left unchanged.
