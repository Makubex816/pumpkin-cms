# No-Go Condition Preview Result

No-go conditions are computed into the normalized manifest and surfaced in preview output.

Covered no-go states:

- `tenant_paused_no_import`;
- `production_mutation_requested`;
- `paused_resume_without_approval`;
- `indexing_requested`;
- validator failure messages for missing prerequisites, protected config references, and secret-like values.

Ice result:

- no no-go conditions.

Roller result:

- `tenant_paused_no_import`;
- future import readiness false;
- no resume executed.
