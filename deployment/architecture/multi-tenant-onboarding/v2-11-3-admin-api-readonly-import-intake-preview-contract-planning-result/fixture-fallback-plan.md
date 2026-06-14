# Fixture Fallback Plan

Fallback sources:

- `valid-import-intake-preview-ice.envelope.json`
- `valid-import-intake-preview-roller.envelope.json`

Fallback behavior:

- Admin loads fixture snapshot when API mode is unavailable, unauthorized, invalid, or degraded.
- Fallback is visibly marked as local fixture-backed.
- Query/filter/sort still operate locally on fixture data.
- Future actions remain disabled.
- API errors never trigger retries that call live provider, CMS, Azure, Google, DNS, or contact endpoints.
