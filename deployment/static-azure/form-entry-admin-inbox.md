# Form Entry Admin Inbox

The Phase 6I lead inbox gives operators a tenant-scoped view of `FormEntry` records saved by Pumpkin form submission flows.

## Runtime Forms

Runtime CMS mode continues to post contact and quote forms through the existing public form endpoint. Those submissions are saved to the `FormEntry` container and can be reviewed in the admin Leads dashboard.

## Static Forms

Static exported public sites cannot rely on Next.js API routes. The static form endpoint strategy remains:

1. A static-compatible endpoint, such as an Azure Function, receives the form POST.
2. The endpoint validates and rate-limits the payload.
3. The endpoint forwards or stores the lead as a Pumpkin `FormEntry`.
4. Admin users review the lead in the same tenant-scoped inbox.

This means the inbox is the destination regardless of whether the lead came from runtime CMS mode or a future static form endpoint.

## Tenant Isolation

The admin endpoints require JWT authentication and tenant context. A user can only list, read, or update lead metadata for the selected tenant unless they have SuperAdmin access.

Ice and Roller leads must remain separated by `tenantId`.

## No Hard Delete

The inbox does not expose hard delete. Lead cleanup should use metadata status such as `spam` or `archived`.

## Exports

The admin UI supports client-side export of the currently loaded and filtered entries:

- CSV for spreadsheet review.
- JSON for preserving the loaded `FormEntry` shape.

Exports include submitted date, form ID, page slug, status, common contact/event fields, and raw `formData` JSON. They do not include tenant API keys or deployment credentials.

## Future CRM and Routing Notes

Future phases can connect `FormEntry` records to lead-routing rules, CRM sync, partner assignment, spam scoring, and fulfillment status. Those actions should remain tenant-scoped and should avoid destructive deletion.
