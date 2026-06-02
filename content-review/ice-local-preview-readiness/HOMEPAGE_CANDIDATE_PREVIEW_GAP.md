# Homepage Candidate Preview Gap

## Candidate

Primary candidate:

```text
content-review/ice-homepage-phase8c14b-normalized/proposed-homepage.normalizer-verified.json
```

Media-selected candidate:

```text
content-review/ice-homepage-media-upload-selection/proposed-homepage.media-selected-candidate.json
```

## Current Runtime Flow

The Ice public app resolves pages through:

```text
apps/ice-rink-web/src/lib/content-source.ts
```

Runtime mode fetches CMS content from Pumpkin API. Static mode loads static content from the static content source. Neither mode currently points directly at the local homepage candidate JSON under `content-review/`.

## Previewability Answers

- Can the public frontend preview existing CMS pages? Yes, if Pumpkin API, local data, and tenant API credentials are available.
- Can it preview fallback pages without CMS? Yes, for routes with fallback data, such as home and contact.
- Can it preview the new normalized homepage candidate without CMS import? No direct route was found.
- Is safe file-based preview mode available for this candidate? Not currently documented or wired for arbitrary `content-review` JSON.
- Is draft-only CMS import needed later? Likely, unless a dedicated file preview route/tool is added.
- Are MediaAsset records required before meaningful homepage preview? Required for CMS-import-ready media; optional only for a rough draft preview if the user explicitly allows unresolved placeholders.
- Does admin preview support existing page routes? Yes, via route-based preview URLs.
- Does admin preview render the new local JSON candidate without import? Not confirmed.

## Lowest-Risk Future Paths

1. Create real tenant-scoped MediaAsset records through an authenticated local admin session, then rerun media binding.
2. Run admin import/export preflight in dry-run mode against the selected homepage package.
3. If explicitly authorized, import as a local CMS draft only, not a live/production page.
4. Alternatively, build a dedicated file-based preview tool that reads approved candidate JSON without saving it to CMS.

