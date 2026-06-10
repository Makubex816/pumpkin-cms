# Rendering Integration Gate Plan

The Phase 2H-5 rendering-control prototype is a deterministic contract for future production rendering. It is not yet integrated into the production renderer.

## Gate Sequence

1. Keep fixture/local render decisions as the canonical contract.
2. Add API read endpoints that expose render decisions in read-only mode.
3. Add Admin read-only views for render consequences.
4. Create renderer adapter plan for Ice and generic tenant bundles.
5. Run static export dry-runs using local/fake data.
6. Compare current renderer output to proposed controlled output.
7. Require Backup Center candidate and restore validation before production gate.
8. Request explicit approval for any production renderer integration.

## Production Rules

- Active links render with safe `rel` and target behavior.
- Disabled links render according to tenant policy.
- Pending review links must not silently render as active.
- Domain-blocked links must not render as active.
- Missing policy should fail closed to conservative behavior.
- Renderer changes must be deterministic for static exports.

## Hard Stops

- No runtime switch in Phase 2H-7.
- No live-page publication.
- No Search Console/indexing.
- No automatic re-enable during restore.

