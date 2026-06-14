# Normalized Package Output Contract

Output path:

`deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/.tmp/v2-11-2/<package-name>/`

Required files:

- `manifest.json`: normalized import package manifest.
- `validation-result.json`: local no-write validator result.
- `preview.json`: intake preview summary.
- `README.md`: local evidence note.

Manifest guarantees:

- stable `packageId`;
- tenant lifecycle state preserved;
- `importMode` recorded;
- `securityBoundary` all blocked actions false for valid packages;
- `redactionPolicy` requires references only and no protected paths;
- `rollbackPlanId` present;
- `validationRefs` include builder and validator refs;
- `noGoConditions` are computed for paused/no-import, production mutation, indexing, and paused resume requests.
