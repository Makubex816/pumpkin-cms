# Admin UI Cleanup Plan

Current evidence:

- V2.8.54A proved the current Leads/FormEntry viewer route as `/dashboard/forms`.
- `/dashboard/leads` is prompt-listed but not implemented.

Recommended decision:

- Implement `/dashboard/leads` as a thin redirect or alias to `/dashboard/forms`.
- Rename navigation to be clear for non-technical operators:
  - Pages
  - Media
  - Themes
  - Forms
  - Leads/Form Entries
  - Import/Export
  - Publishing
  - Tenants
  - Settings

TenantAdmin guidance:

- Show tenant-scoped Pages, Media, Themes, Forms, Leads/Form Entries, Import/Export, Publishing, and Settings.
- Hide or demote platform-wide tenant controls unless role grants access.

SuperAdmin guidance:

- Add Tenants and platform governance surfaces.
- Keep Forms and Leads/Form Entries separate enough that builders edit definitions and operators read submissions.

Future phase:

Run a narrow visual cleanup implementation with route alias/redirect and nav relabeling only. Do not bundle broad redesign.

