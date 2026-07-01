# External Model DB Assumption Preservation

V2.8.53S did not rename, migrate, or swap live database containers.

Preserved assumptions:

- FormEntry documents remain in `FormEntry`.
- FormDefinition documents remain in `FormDefinition`.
- Tenant API-key validation remains tenant-scoped.
- Admin FormEntry reads remain tenant-scoped.
- Dynamic submit aliases are backed by public active/published FormDefinitions.

No external database assumption was mutated.
