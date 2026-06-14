# Risk And Open Decisions

Risks:

- Admin has not yet been switched to this API surface.
- The provider is fixture-backed only; live provider work remains a separate boundary.
- Authorization uses current local claims and should be revisited before cross-tenant live-provider behavior.

Open decisions:

- whether V2.9.10 should be bridge planning only or bridge implementation;
- whether Admin should keep fixture mode as default after bridge implementation;
- whether future detail routes are needed beyond the 8 read-only list/summary routes.

