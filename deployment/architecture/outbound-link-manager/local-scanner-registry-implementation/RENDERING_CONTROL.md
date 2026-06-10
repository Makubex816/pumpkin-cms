# Rendering Control

The rendering-control prototype reads:

- a local outbound link store under `.tmp`;
- local policies;
- link statuses;
- instance statuses;
- fixture render targets.

It writes deterministic local artifacts only:

- `render-decisions.json`
- `render-report.json`
- `RENDER_REPORT.md`
- `static-export.html`
- `VALIDATION_RESULT.json`
- `VALIDATION_RESULT.md`

Command:

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-active-links.fixture.json --store .tmp/local-store-merged --out .tmp/render-active --overwrite
```

This does not modify, import, or call any production renderer.
