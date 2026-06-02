# Next Action Checklist

## To Inspect Current Local Pages

- Start Pumpkin API on `http://localhost:5064`.
- Start the Ice public app on `http://localhost:3002`.
- Open `/`, `/contact`, and `/service-areas`.
- Treat `/service-areas` as CMS-dependent; a 404 is acceptable if no CMS page is available.
- Do not submit forms unless a dry-run form test is explicitly requested.

## To Preview The New Homepage Candidate Later

- Decide whether preview should use a dedicated file-based preview or local CMS draft import.
- Resolve whether unresolved `mediaAssetId: null` placeholders are acceptable for a draft-only visual preview.
- If MediaAssets are required first, use an authenticated local admin session to create/select tenant-scoped Ice MediaAssets without printing token values.
- Rerun media binding after real MediaAsset IDs exist.
- Run admin import/export dry-run preflight against the selected candidate.
- Only after explicit authorization, import as local CMS draft.

## Still Not Ready For

- CMS import as a production-ready homepage.
- Production static regeneration.
- Deployment.
- DNS or Microsoft 365 changes.
- Real email sending.
- Roller work.

