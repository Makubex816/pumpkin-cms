# Forms/Leads Route Decision

Decision: keep `/dashboard/forms` canonical and support `/dashboard/leads` as a redirect alias.

Rationale:

- Existing source and nav use `/dashboard/forms`.
- The nav label already says `Leads/Form Entries`.
- FormEntry APIs and detail routes are already under forms terminology.
- A redirect alias is lower risk than renaming routes or changing API behavior.

Outcome:

- `/dashboard/forms`: canonical Lead Inbox.
- `/dashboard/forms/[id]`: canonical FormEntry detail route.
- `/dashboard/leads`: redirect alias to `/dashboard/forms`.

No deploy was performed.
