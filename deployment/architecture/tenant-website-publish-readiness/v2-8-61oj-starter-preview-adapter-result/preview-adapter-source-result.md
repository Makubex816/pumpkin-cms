# Preview Adapter Source Result

Status: implemented and source-reviewed.

Changed source:

- `apps/starter-app/src/lib/preview-fixtures.ts`
- `apps/starter-app/src/app/preview/[tenantId]/[[...slug]]/page.tsx`
- `apps/starter-app/src/components/PageRenderer.tsx`
- `apps/starter-app/src/components/ContactFormBlock.tsx`

Behavior:

- Loads bundled fixture JSON from `preview-fixtures/{tenantId}/preview.json`.
- Validates tenant id before filesystem lookup.
- Renders `/preview/[tenantId]/[[...slug]]` with existing starter header, page renderer, and footer.
- Prefixes internal preview navigation under `/preview/{tenantId}`.
- Passes preview mode into form rendering.
- Disables/no-ops preview form submission.

Boundary:

- Generic adapter; no Party Pros hard-coding in source.
- No API key requirement.
- No appsetting mutation requirement.
- No CMS write path.
- No Party Pros publish requirement.
- No Airstrip dependency.
