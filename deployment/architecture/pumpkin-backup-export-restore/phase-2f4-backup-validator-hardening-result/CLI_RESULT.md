# CLI Result

The CLI remains local-only and supports:

- `help`;
- `version`;
- `create-standard`;
- `validate`;
- `inspect`.

`validate` writes JSON and Markdown validation reports by default and exits non-zero when validation fails.

The CLI accepts bundle/output paths only under package `.tmp` and blocks archive-style paths. It prints only non-secret status and manifest summary fields.
