# Validator Replay Result

Status: final validator replay passed.

Initial replay:

- Valid: false.
- Errors: 1.
- Gap: `TenantId mismatch in conversion/source-map.json: party-pros`.
- Interpretation: the compiler spread the analyzer source-map tenant label into a normalized package file.

Output-only normalization:

- Normalized `conversion/source-map.json` to tenant id `party-pros-philadelphia`.
- Preserved the analyzer label as non-tenant metadata.
- Added confirmed owner metadata and Party Pros form/theme labels.
- Rewrote generated JSON as UTF-8 without BOM for validator compatibility.
- Dropped no routes, media assets, or form candidates.

Final replay:

- Valid: true.
- Errors: 0.
- Warnings: 0.
- Package mode: `full-template`.
- Tenant id: `party-pros-philadelphia`.
- Media assets checked: 627.
- Form files checked: 1.
- Expected routes checked: 397.
- Responsive routes checked: 10.
- Responsive viewports checked: 7.
- Secret-like hits: 0.

