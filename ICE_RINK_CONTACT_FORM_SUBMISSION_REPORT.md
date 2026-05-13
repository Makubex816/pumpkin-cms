# Ice Rink Contact Form Submission Report

## Summary

The `apps/ice-rink-web` CMS-backed Contact block is now wired to submit quote requests to Pumpkin API and store them in the Cosmos `FormEntry` container. The browser submits to an app-local Next route, and that server route forwards the request to Pumpkin API with the tenant API key kept server-side.

## Root Cause Of Placeholder Alert

The real server route was already working, but the visible browser form could still hit the older client-side contact handler path. That older path showed the placeholder alert:

```text
Thanks for reaching out. The form handler is ready to connect to Pumpkin forms.
```

The fix makes the polished Contact block submit directly to `/api/contact` by default and show inline status messages. `PageRenderer` no longer passes a parent submit handler into the polished Contact block, which removes the stale placeholder path from the visible browser form.

## Endpoint Discovered

Pumpkin API already exposes:

```text
POST /api/forms/{tenantId}/entries
```

The endpoint expects a `FormEntry` body:

- `id`
- `tenantId`
- `formId`
- `pageSlug`
- `formData`
- `submittedAt`
- `ipAddress`
- `userAgent`
- `metadata.source`
- `metadata.referrer`
- `metadata.status`
- `metadata.tags`

It requires:

```text
Authorization: Bearer {tenantApiKey}
```

The API validates the tenant API key, requires `formId`, fills missing tenant/timestamp values, and writes to the `FormEntry` container.

## Files Changed

- `apps/ice-rink-web/src/app/api/contact/route.ts`
- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `ICE_RINK_CONTACT_FORM_SUBMISSION_REPORT.md`

No shared packages, admin app files, `.env.local`, or `appsettings.Development.json` files were modified.

## How Form Submission Works

1. The CMS-backed Contact block renders form fields from `content.formFields`.
2. The polished local Contact renderer collects submitted values using the CMS field labels.
3. The browser posts to:

   ```text
   POST /api/contact
   ```

4. The Next route resolves the current site from the request host.
5. The route builds a Pumpkin `FormEntry`.
6. The route forwards the entry to Pumpkin API:

   ```text
   POST http://localhost:5064/api/forms/{tenantId}/entries
   ```

7. On success, the form resets and shows:

   ```text
   Thanks — your quote request was submitted.
   ```

8. On failure, the form shows a helpful error message and allows retry.

## API Key Secrecy

The browser never receives `ICE_RINK_RENTALS_API_KEY`.

The API key is read only server-side through the existing site resolution/env config. The app-local Next route adds the Bearer token when forwarding to Pumpkin API.

## Local Test Performed

With Pumpkin API running on `http://localhost:5064` and `apps/ice-rink-web` running on `http://localhost:3002`, a test submission was posted to:

```text
http://localhost:3002/api/contact
```

Result:

```json
{
  "ok": true,
  "entryId": "ice-rink-rentals-contact-c2f888c6-ad7b-4788-95bd-f8f6e3873a8f"
}
```

## Browser Form Test Result

A headless Chrome browser test submitted the visible form at:

```text
http://localhost:3002/contact
```

Result:

```text
DIALOG_COUNT:0
CONTACT_STATUS:200
CONTACT_RESPONSE:{"ok":true,"entryId":"ice-rink-rentals-contact-04af5142-5a4e-4ebb-800c-ccd5eea010a8"}
SUCCESS_MESSAGE:Thanks — your quote request was submitted.
```

This confirms the visible page no longer uses `alert()` and now shows the inline success message.

## How To Test In Browser

Open:

```text
http://localhost:3002/contact
```

Fill the quote form and submit. Expected result:

- Submit button changes to `Sending...` while loading.
- A success message appears after Pumpkin API stores the entry.
- A helpful error appears if Pumpkin API is unavailable or rejects the request.
- Double-submit is prevented while the request is in progress.

## Cosmos Verification Path

Use Cosmos Emulator Data Explorer:

```text
https://localhost:8081/_explorer/index.html
```

Then verify the created item under:

```text
PumpkinCMS
  FormEntry
    Items
```

Partition key:

```text
ice-rink-rentals
```

The latest browser form test returned this created entry id:

```text
ice-rink-rentals-contact-04af5142-5a4e-4ebb-800c-ccd5eea010a8
```

Pumpkin API only returns `ok: true` from the Next route after the backend form endpoint successfully creates the `FormEntry`. Use the id above to confirm the item visually in Cosmos Data Explorer.

## Checks Run

From `apps/ice-rink-web`:

```powershell
npm run lint
npm run type-check
npm run build
```

Results:

- `npm run lint`: passed with no ESLint warnings or errors.
- `npm run type-check`: passed.
- `npm run build`: passed.

## Limitations

- There is still no public or admin UI in this task for browsing submitted form entries.
- The form uses CMS field labels to generate field keys, so future label changes may change submitted `formData` keys.
- The implementation stores submissions through the existing Pumpkin API endpoint only; it does not send email notifications yet.
- If Pumpkin API is unavailable, the page still renders through existing fallback behavior, but submission returns an error instead of storing offline.

## Next Recommended Step

Add an admin-side or local verification view for `FormEntry` records, then decide whether quote submissions should also trigger email notifications or CRM-style lead handling.
