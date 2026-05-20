# Pumpkin Form Builder Phase 6J Report

## Summary

Phase 6J adds a tenant-scoped Form Builder / Form Template Editor MVP.

The MVP edits existing page-driven Contact/Quote forms rather than creating a new form-definition container. This keeps form template changes on the existing authenticated page update path, so revision/rollback metadata and `staticPublishing.needsRebuild` behavior remain intact.

No hard delete, Azure deployment, Cloudflare action, provider/state research, production page generation, browser shell execution, or tenant API key exposure was added.

## Files Changed

- `apps/admin/src/app/dashboard/layout.tsx`
- `apps/admin/src/app/dashboard/form-builder/page.tsx`
- `apps/admin/src/app/dashboard/pages/[id]/edit/page.tsx`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/pumpkin-api/Services/PageRevisionHelper.cs`
- `apps/pumpkin-net-models/Models/ContactBlock.cs`
- `apps/pumpkin-net-models/Models/Page.cs`
- `packages/pumpkin-ts-models/src/models/InteractionBlocks.ts`
- `packages/pumpkin-ts-models/src/models/Page.ts`
- `packages/pumpkin-ts-models/dist/models/InteractionBlocks.d.ts`
- `packages/pumpkin-ts-models/dist/models/Page.d.ts`
- `deployment/static-azure/form-builder-and-static-forms.md`
- `PUMPKIN_FORM_BUILDER_PHASE6J_REPORT.md`

## Source-Of-Truth Decision

Current public form definitions live in existing Page documents:

- Contact/Quote form fields are stored in `ContentData.ContentBlocks[]` where block `type` is `Contact`.
- Submit button text, heading/subtitle, labels, placeholders, required flags, and field types are stored on the Contact block.
- Routing/static metadata lives in `page.formConfig`.

No new `FormDefinition` Cosmos container was added. That keeps this phase low-risk and preserves existing rendering/import/export behavior.

## Admin Route Added

```text
/dashboard/form-builder
```

The admin navigation now separates:

- `Leads` for submitted `FormEntry` records.
- `Form Builder` for editing public form templates/fields.

## Edit Form UX Fix

Root cause:

- The first detected form was already auto-selected when the Form Builder loaded.
- Clicking `Edit Form` on that same row did update the selected form state, but the editor was already open lower on the page.
- There was no scroll, focus, active button state, or feedback message, so the click appeared to do nothing.

Fix:

- `Edit Form` now explicitly selects the clicked form and scrolls/focuses the `Edit Form Template` section.
- The selected table row has a stronger active state.
- The selected row action changes from `Edit Form` to `Editing`.
- A feedback message appears, such as `Editing contact form on contact page.`
- The editor header now clearly shows the form ID, page slug, and page title.
- A `Form List` anchor was added to jump back to the detected form table.

## Fields Editable

The Form Builder lists tenant forms detected from Contact blocks and allows editing:

- heading/title
- subtitle
- submit button text
- form type
- conversion goal
- routing mode
- recipient group
- static form endpoint key
- thank-you URL
- thank-you message
- consent/spam-protection flags
- field label
- field key/name
- field type
- placeholder
- required flag
- help text
- select/checkbox options
- field order by move up/down

The form ID is shown as guarded/read-only in this MVP.

## Field Key Guardrails

Field keys are treated as advanced because they become future `FormEntry.formData` keys.

The builder:

- hides field keys by default
- explains that changing keys affects future submissions
- warns when a field key changes from the loaded template
- does not rename existing `FormEntry` records
- detects duplicate field keys as save-blocking validation errors

## Normalized Lead Mapping

`page.formConfig.normalizedFieldMap` was added as a safe metadata extension.

Supported normalized mapping keys:

```text
name, email, phone, eventDate, eventLocation, eventType, estimatedAttendance, message
```

This gives future lead exports/routing a stable map even when public labels change.

## Validation Warnings

The builder shows warnings for:

- missing submit button text
- missing recommended lead mappings
- required fields without labels
- select/checkbox fields without options
- missing static form endpoint key
- missing consent/spam-protection configuration
- Google Ads eligible pages with weak form/CTA setup
- field key changes

Duplicate field keys and unsupported field types block save.

## Save And Revision Behavior

Saving uses the existing authenticated admin page update endpoint:

```text
PUT /api/admin/pages/{tenantId}/{pageSlug}
```

The save passes `changeSource=form_builder` and a Form Builder change summary.

The API revision helper now recognizes `form_builder`, creates a pre-update snapshot, increments revision metadata, and marks `staticPublishing.needsRebuild = true`.

Unknown page/block fields are preserved as part of the existing page document update flow.

## Static Publishing Impact

Form edits mark the page as needing static rebuild.

The public frontend still supports:

- runtime mode posting to `/api/contact`
- static mode requiring an external endpoint
- Contact field rendering from Contact block data

Frontend rendering now respects optional Contact field `name`/`key`, `helpText`, `options`, `select`, `checkbox`, `hidden`, and page-level thank-you message injection.

## Public Contact Form Feedback Fix

Root cause found during the public contact form UX pass:

- Phase 6J injected `page.formConfig.thankYouMessage` into the Contact block.
- Some pages have `thankYouMessage` present as an empty string.
- The empty string overrode the fallback success message, so a successful submit could save correctly but show no visible confirmation.
- The submitting state also relied mostly on button text, which was too easy to miss during browser testing.

Fix:

- Empty thank-you messages no longer override the fallback success message.
- Runtime and static submit errors now read either `error` or `message` from endpoint JSON.
- The public Contact form now shows a visible inline submitting message: `Sending your quote request...`.
- The submit button remains disabled and reads `Sending...` while posting.
- Successful submissions show a clear inline success message near the form.
- Failed submissions show a clear inline error message near the form.
- Success/error messages use `role`, `aria-live`, and focus so they are easier to notice.
- Static mode still throws a clear error if no static form endpoint is configured and does not pretend success.

## Import/Export Impact

JSON import/export preserves full Page documents, including Contact block fields and `formConfig.normalizedFieldMap`.

CSV/XLSX import/export already includes a `formConfig` JSON column, so the normalized field map is preserved through that JSON column. No additional flattened CSV/XLSX columns were added in this phase.

## Runtime Verification

Automated local verification completed:

- Pumpkin API started successfully.
- API root endpoint returned HTTP `200`.
- Admin dev server started on port `3001`.
- `/dashboard/form-builder` returned HTTP `200`.
- Temporary API/admin verification processes were stopped after checks.

Post-UX-fix verification completed:

- Admin type-check passed after the `Edit Form` scroll/focus/feedback change.
- Targeted Form Builder lint passed.
- Admin route smoke check confirmed `/dashboard/form-builder` still returns HTTP `200`.

Public contact form verification completed:

- The stale dev server on port `3002` was cleanly restarted and the ignored `.next` cache was regenerated.
- Before the clean restart, browser-like requests hit a stale Next dev error for a missing generated `lucide-react` vendor chunk; this explains the unstyled public page observed during testing.
- After the clean restart, public `/contact` returned HTTP `200`, included `_next` CSS references, included the Contact form, and no longer returned the stale vendor-chunk error.
- Headless Edge browser verification confirmed the page title, one stylesheet, one styled form, a white rounded form container, and the expected field names: `name`, `email`, `phone`, `event-date`, `event-location`, `venue-type`, `estimated-attendance`, `surface-details`, and `rental-goals`.
- The browser test held the `/api/contact` POST long enough to verify the loading UX: the submit button changed to `Sending...`, was disabled, and the inline message `Sending your quote request...` appeared.
- After the POST continued, the browser displayed the inline success message `Thank you. Your request has been received.`
- Public `/api/contact` also accepted a direct local test submission and returned `ok: true` with a generated FormEntry ID.
- The successful browser/API responses confirm the runtime path forwarded to Pumpkin API and created `FormEntry` records.
- Authenticated Lead Inbox display of the new browser-created entry was not re-opened in this pass, but Phase 6I browser verification already confirmed loaded FormEntry rows/details display correctly and the new successful FormEntry creation confirms the inbox has a record to load.

Manual browser verification for the UX fix should confirm:

1. Open `/dashboard/form-builder`.
2. Click `Edit Form` on the `contact` form.
3. Confirm the page scrolls/focuses to `Edit Form Template`.
4. Confirm the selected row is obvious and the action reads `Editing`.
5. Confirm the feedback message appears.
6. Save a harmless placeholder/help text change.
7. Confirm public contact form rendering and Lead Inbox still work.

Remaining authenticated admin/browser checks if Timothy wants one more manual pass:

1. Log into admin.
2. Open `/dashboard/form-builder`.
3. Select `ice-rink-rentals`.
4. Open the Contact/Quote form.
5. Change a harmless label or placeholder.
6. Save and confirm success feedback.
7. Confirm page revision metadata exists and `staticPublishing.needsRebuild` is true.
8. Open the public contact page and confirm the label/placeholder change appears.
9. Submit a safe test lead and confirm Lead Inbox still receives/displays it.
10. Switch to `roller-rink-rentals` and confirm tenant-scoped form templates load separately.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for Form Builder, dashboard layout, page editor preservation, and admin API client - passed
- post-UX-fix `npm run type-check` in `apps/admin` - passed
- post-UX-fix targeted Form Builder lint - passed
- `npm run type-check` in `apps/ice-rink-web` - passed
- initial `npm run type-check` in `apps/ice-rink-web` failed before build because generated `.next/types` files were missing; after `next build` regenerated them, type-check passed
- `npm run lint` in `apps/ice-rink-web` - passed
- `npm run build` in `apps/ice-rink-web` - passed
- clean public frontend restart on port `3002` after clearing ignored stale `.next` cache - passed
- public `/contact` browser-like HTTP/style markup check - passed
- headless Edge browser form UX check - passed
- public `/api/contact` local test submission - passed and returned `ok: true`
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - passed after stopping the locked local Pumpkin API/build-server process
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - passed after stopping the locked local Pumpkin API process
- `npm run validate:static:ice` in `apps/ice-rink-web` - passed with existing content-readiness warnings
- `npm run validate:static:roller` in `apps/ice-rink-web` - passed with existing content-readiness warnings
- `git diff --check` - passed with line-ending normalization warnings only
- targeted high-confidence secret scan over changed files - passed
- protected config check for `.env.local` and `appsettings.Development.json` - no changes

## Known Limitations

- No standalone `FormDefinition` collection exists yet.
- Form ID editing is guarded/read-only in the MVP.
- Field removal is intentionally not included; fields can be added and reordered.
- Lead Inbox uses heuristic field extraction today; future work can consume `normalizedFieldMap`.
- No drag-and-drop field builder was added.
- No CRM sync, partner routing, spam scoring, or Azure Function deployment was added.
- Full authenticated browser save/submission verification is still pending manual testing.

## Next Recommended Phase

Phase 6K should either connect `normalizedFieldMap` into Lead Inbox/export extraction or add a static-form Azure Function implementation package, depending on whether operator lead workflow or production static launch is the next priority.
