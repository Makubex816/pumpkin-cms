# Form Builder and Static Forms

Phase 6J separates two admin jobs:

- **Lead Inbox** reviews submitted `FormEntry` records.
- **Form Builder** edits public Contact/Quote form templates that future submissions use.

## Source Of Truth

The MVP source of truth remains page/block content:

- Contact form fields live inside `Page.ContentData.ContentBlocks[]` where `type` is `Contact`.
- Public form routing and static-publishing metadata live in `page.formConfig`.
- No new `FormDefinition` container is required for this phase.

This keeps form edits on the existing page update path, which means revision/rollback metadata and `staticPublishing.needsRebuild` behavior continue to apply.

## Runtime CMS Forms

Runtime CMS mode still posts through the existing Next.js `/api/contact` route. The route saves submissions as Pumpkin `FormEntry` records.

The Form Builder changes labels, placeholders, required flags, submit button text, and related form metadata. Those edits affect future submissions only; existing `FormEntry` records are not rewritten.

## Static Forms

Static exported sites cannot rely on Next.js API routes. Public static form submissions still require a static-compatible endpoint, such as:

- Azure Function
- standalone Pumpkin API endpoint
- external CRM/form endpoint

The Form Builder records `formConfig.staticFormEndpointKey` so operators can see whether the page has a static endpoint key recorded. Actual endpoint deployment is still separate from this phase.

## Field Key Safety

Public form field keys become `FormEntry.formData` keys. Changing keys can affect:

- Lead Inbox display
- CSV/JSON exports
- future CRM sync
- historical comparison with older submissions

The Form Builder marks field-key editing as advanced and warns that existing `FormEntry` records are not renamed.

## Normalized Lead Mapping

`formConfig.normalizedFieldMap` can map public form field keys to normalized lead concepts:

- `name`
- `email`
- `phone`
- `eventDate`
- `eventLocation`
- `eventType`
- `estimatedAttendance`
- `message`

This lets labels evolve while lead exports and future routing can stay stable.

## Future Azure Function Flow

A future static endpoint should:

1. Receive the static public form POST.
2. Validate payload shape and required fields.
3. Apply rate-limit/spam protection.
4. Write a `FormEntry` record for the correct tenant.
5. Return safe JSON success/error responses.

No Azure deployment, Cloudflare change, or production endpoint creation is included in Phase 6J.
