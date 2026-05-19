# Pumpkin Form Entry Lead Inbox Phase 6I Report

## Summary

Phase 6I adds a tenant-scoped Form Entries / Lead Inbox dashboard for reviewing quote/contact submissions saved as `FormEntry` records.

The implementation is read-first and safe: admins can list leads, inspect one lead, update lead status metadata, and export loaded entries as CSV or JSON. No hard delete, Azure deployment, Cloudflare action, provider research, state research, production page generation, or browser shell execution was added.

## Files Changed

- `apps/pumpkin-net-models/Models/FormEntry.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api/Program.cs`
- `apps/admin/src/lib/api.ts`
- `apps/admin/src/app/dashboard/layout.tsx`
- `apps/admin/src/app/dashboard/forms/page.tsx`
- `apps/admin/src/app/dashboard/forms/[id]/page.tsx`
- `deployment/static-azure/form-entry-admin-inbox.md`
- `PUMPKIN_FORM_ENTRY_LEAD_INBOX_PHASE6I_REPORT.md`

## API Endpoints Added

```text
GET   /api/admin/{tenantId}/form-entries
GET   /api/admin/{tenantId}/form-entries/{id}
PATCH /api/admin/{tenantId}/form-entries/{id}
```

All endpoints:

- require JWT admin authentication
- enforce tenant scope
- do not expose tenant API keys
- do not delete form entries
- do not alter submitted `formData` during status updates

The `PATCH` endpoint updates lead workflow metadata only. Supported statuses are:

```text
new, reviewed, contacted, quoted, won, lost, spam, archived
```

## Admin Routes Added

```text
/dashboard/forms
/dashboard/forms/[id]
```

The dashboard navigation now includes a `Leads` link.

## Form Entry Fields Displayed

The Lead Inbox displays:

- submitted date/time
- name
- email
- phone
- event date
- event location
- form ID
- page slug
- status
- detail action

The detail view displays:

- contact information
- event information
- all `formData` key/value pairs
- metadata source/referrer/tags/status
- page slug/source page
- submitted date/time
- entry ID and tenant ID
- IP address and user agent as lower-emphasis request metadata
- copy-friendly lead summary

Common lead fields are extracted from likely formData aliases such as `name`, `fullName`, `email`, `phone`, `eventDate`, `eventLocation`, `city`, and `venue`.

## Status Behavior

Status update is implemented on the lead detail page.

Changing status:

- calls the authenticated tenant-scoped `PATCH` endpoint
- updates `metadata.status`
- preserves `metadata.tags`
- preserves submitted `formData`
- does not delete, archive by deletion, or mutate source lead content

`archived` is a metadata status only, not a hard delete.

## Export Behavior

The Lead Inbox supports client-side export of the currently loaded and filtered entries:

- CSV export
- JSON export

CSV columns:

```text
submittedAt, formId, pageSlug, status, name, email, phone, eventDate, eventLocation, formDataJson
```

JSON export includes:

- tenantId
- exportedAt
- count
- formEntries

Exports are generated in the browser from already loaded entries and do not call a bulk export endpoint.

## Tenant Safety

Tenant isolation is enforced at both layers:

- API endpoints compare route tenant to the JWT tenant unless the user is SuperAdmin.
- Admin list/detail requests use the selected/current tenant context.
- The detail route blocks viewing if the route tenant does not match the selected tenant.
- Switching tenants refreshes lead data.

Ice and Roller entries remain separated by `tenantId`.

## Static Form Strategy Connection

The new documentation in `deployment/static-azure/form-entry-admin-inbox.md` explains how the inbox fits both modes:

- Runtime CMS forms continue using the current form submission path and save `FormEntry` records.
- Future static form endpoints, such as Azure Functions, should validate static form POSTs and forward/store them as `FormEntry` records.
- The admin Lead Inbox remains the review destination regardless of runtime or static submission source.

## Checks Run

- `npm run type-check` in `apps/admin` - passed
- targeted admin lint for Leads dashboard, lead detail, dashboard layout, and admin API client - passed
- `dotnet build apps/pumpkin-net-models/pumpkin-net-models.csproj` - initially blocked by a running local Pumpkin API process, then passed after stopping it
- `dotnet build apps/pumpkin-api/pumpkin-api.csproj` - initially blocked by a running local Pumpkin API process, then passed after stopping it
- Pumpkin API started locally after build verification
- API root endpoint returned HTTP `200`
- unauthenticated `GET /api/admin/ice-rink-rentals/form-entries` returned HTTP `401`, confirming JWT protection is active
- temporary local Pumpkin API verification process was stopped after checks
- `git diff --check` - passed with line-ending normalization warnings only
- targeted high-confidence secret scan over changed files - passed; broad scan findings were code identifier references, not secret values
- protected config check for `.env.local` and `appsettings.Development.json` - no changes

## Runtime Verification

Automated local runtime verification confirmed:

- Pumpkin API starts with the new endpoints registered.
- The root API endpoint responds.
- The admin form-entry list endpoint rejects unauthenticated access with HTTP `401`.

Completed manual browser runtime verification:

- Pumpkin API, admin, and frontend were all running.
- Admin login worked.
- Leads/Form Entries dashboard loaded.
- Ice tenant `FormEntry` submissions loaded.
- FormEntry rows displayed submitted contact/event data.
- View action worked.
- FormEntry detail page opened successfully.
- Full submitted data displayed on the detail page.
- CSV export worked for loaded entries.
- JSON export worked for loaded entries.
- This phase manages submitted `FormEntry`/lead records only.
- Editing actual form templates/fields is not part of Phase 6I and should be handled later as a separate Form Builder phase if needed.
- Status update was not manually verified.
- No hard delete exists.
- No `.env.local` or `appsettings.Development.json` changes were made.

## Known Limitations

- No hard delete exists, by design.
- No XLSX lead export was added.
- No server-side bulk export endpoint was added.
- Date-range filtering is deferred.
- CRM sync, lead routing, spam scoring, and partner assignment are future work.
- Status update exists in the implementation but was not manually browser-verified in Phase 6I.
- Editing form templates/fields is not part of this phase and should be handled as a future Form Builder phase if needed.

## Next Recommended Phase

Phase 6J should add lead routing/assignment metadata or a read-only publish-run detail page, depending on whether the next priority is sales operations or publishing auditability.
