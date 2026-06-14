# Admin Read-Only Intake Preview Scope

Future Admin route:

`/dashboard/import-intake`

Allowed in future implementation:

- read fixture-backed or API-backed import package previews;
- list package candidates;
- show package summary, lifecycle, refs, no-go conditions, rollback, and next gates;
- compare Ice ready candidate with Roller paused/no-import candidate;
- show all future actions disabled.

Not allowed:

- execute import;
- create or resume tenant;
- edit package;
- write CMS/provider/MediaAsset records;
- submit contact forms;
- deploy, mutate DNS, request indexing, or call Azure.

Provider modes:

- `admin-local-import-package-fixture-readonly`;
- `admin-api-import-intake-readonly`.
