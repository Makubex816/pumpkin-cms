# Validator Integration Model

## Integration Principle

The builder should use the existing Phase 2A offline validator as the package authority. Builder UI rules help prevent obvious mistakes, but final package readiness comes from a full validator run.

## When To Validate

- Validate individual fields inline while the user types or leaves a field.
- Validate each screen before marking it complete.
- Run focused draft checks after pages, media, forms, SEO, and owner gates.
- Generate a temporary local package and run the full validator before package export.
- Run the full validator again after any fix that affects generated JSON.

## Error Display

Show each finding in three layers:

- short plain-language message
- affected screen/field and JSON file path for operators
- fix action with owner role

Use the Phase 2A-3 error explanation catalog when available.

## Blocking Rules

- Critical and error findings block "ready for operator handoff" package export.
- Draft export may be allowed only with an explicit "failed draft package" label and operator permission.
- Support packet export must remain available even when validation fails.
- Warnings can be treated as blockers in strict/operator mode.

## Validator Outputs

The builder should consume:

- `overallStatus`
- `summary`
- `gateStatuses`
- `findings`
- `nextActions`
- `boundaryConfirmation`
- generated report files
- support packet files

## Offline Mode

The Phase 2B builder must default to offline mode:

- no external HTTP checks
- no CMS reads/writes
- no Azure, Cloudflare, or DNS checks
- no email/Microsoft 365 actions
- no Search Console/indexing actions
- no Roller work

Any later external check would require separate approval and a new hard-stop model.
