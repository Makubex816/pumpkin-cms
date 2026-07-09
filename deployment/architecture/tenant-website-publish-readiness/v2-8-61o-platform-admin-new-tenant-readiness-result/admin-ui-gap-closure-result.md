# Admin UI Gap Closure Result

Status: completed locally.

Changed source:

- `apps/admin/src/app/dashboard/leads/page.tsx`

Implementation:

```tsx
import { redirect } from 'next/navigation'

export default function LeadsAliasPage() {
  redirect('/dashboard/forms')
}
```

Effect:

- `/dashboard/leads` becomes a no-mutation alias for `/dashboard/forms`.
- The canonical Forms/Lead Inbox route remains `/dashboard/forms`.
- No API route changed.
- No data model changed.
- No write control was added.
- No deploy was performed, so live proof of this alias is deferred until a later deploy-approved phase.

Local validation note:

- The new alias file is not named in the `npm run type-check` or `npm run build` failures.
- Admin type-check/build currently fail on pre-existing type/model drift in form-builder/theme code and an existing `pumpkin-ts-models` browser bundle issue.
