# Pumpkin Admin UI Cleanup Plan V2.8.54G

Status: planned_not_implemented

Current route truth:

- Leads/FormEntry readback exists at `/dashboard/forms`.
- `/dashboard/leads` is not implemented.

Recommended cleanup:

- Make `/dashboard/forms` visibly represent Leads/Form Entries.
- Add `/dashboard/leads` as a redirect/alias to `/dashboard/forms`, or remove the nav reference.
- Use clear nav grouping: Pages, Media, Themes, Forms, Leads/Form Entries, Import/Export, Publishing, Tenants, Settings.
- Keep the first implementation narrow: route alias/redirect, nav naming, and role-aware grouping only.

No UI source was changed in V2.8.54G.

