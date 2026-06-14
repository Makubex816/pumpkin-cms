# Admin Route Result

Route implemented:

`/dashboard/import-intake`

API mode query:

`/dashboard/import-intake?importIntakeProvider=admin-api-import-intake-readonly`

Default mode remains fixture-backed:

`admin-local-import-package-fixture-readonly`

If API mode fails or lacks auth/runtime availability, Admin degrades to fixture fallback and shows the fallback reason.
