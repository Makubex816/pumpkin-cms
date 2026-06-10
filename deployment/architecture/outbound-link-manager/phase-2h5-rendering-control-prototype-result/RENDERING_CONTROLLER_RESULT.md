# Rendering Controller Result

Implemented controller files:

- `src/rendering/rendering-controller.mjs`
- `src/rendering/render-policy-resolver.mjs`
- `src/rendering/link-renderer.mjs`
- `src/rendering/render-output-writer.mjs`
- `src/rendering/render-report-writer.mjs`

The controller consumes:

- local outbound link store files;
- active local policy;
- outbound link statuses;
- outbound link instance statuses;
- fixture render targets.

It writes:

- `render-decisions.json`
- `render-report.json`
- `RENDER_REPORT.md`
- `static-export.html`

All output is local `.tmp` proof output only.
