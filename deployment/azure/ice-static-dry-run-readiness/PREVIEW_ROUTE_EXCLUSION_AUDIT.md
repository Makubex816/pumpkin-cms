# Preview Route Exclusion Audit

## Static Mode Fixes

Static-mode preview exclusions are now handled locally:

- `next.config.js` returns no preview rewrites when `PUMPKIN_RENDER_MODE=static`
- `static-publish.mjs` removes excluded preview output paths before copying the static artifact

No CMS or preview-route source files were deleted.

## Fresh Static Output

The fresh output route scan found no deployable preview route folders:

- `/__preview/...`: absent
- `/draft-preview/...`: absent

The compact output scan found:

- `/__preview/`: 0 references
- `/draft-preview/`: 0 references

`draft-preview` appears only in the static-publish manifest warning that records removed preview output paths.

## Gate Status

Preview route exclusion result: pass for local route-shape proof.
