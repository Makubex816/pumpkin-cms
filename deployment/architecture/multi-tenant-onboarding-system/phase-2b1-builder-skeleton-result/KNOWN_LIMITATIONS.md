# Known Limitations

- This is a skeleton builder, not a full guided wizard.
- Non-technical users still need a prepared answers JSON file.
- The answers format is documented but does not yet have a dedicated JSON Schema file.
- The builder currently supports one generated form collection shape.
- The builder does not upload or copy media files.
- The builder does not verify external media URLs.
- The builder does not create tenants or import packages into CMS.
- The builder does not handle runtime secrets beyond placeholders.
- The builder does not implement `--version`.
- The builder does not separate report output from generated package output.
- Custom block validation is primarily handled by the offline validator after generation.

These limitations are suitable for the Phase 2B-1A skeleton and should be addressed in Phase 2B-2 hardening before broader operator use.
