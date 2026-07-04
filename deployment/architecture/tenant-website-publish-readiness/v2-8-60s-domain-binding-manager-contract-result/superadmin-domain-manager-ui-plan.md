# SuperAdmin Domain Manager UI Plan

Status: design complete.

## Routes

Primary route:

- `/dashboard/onboarding/domains`

Optional tenant-scoped route if the admin routing structure is extended:

- `/dashboard/tenants/[tenantId]/domains`

## Access

- SuperAdmin only.
- TenantAdmin, Editor, and Viewer users must not see nav entries or access pages.
- API responses must enforce the same authorization as the UI.

## Screens

Domain Overview:

- Tenant selector.
- Current default host.
- Current canonical domain.
- Pending domain bindings.
- State, last proof, and blockers.

Add/Replace Domain:

- Apex domain.
- www domain.
- Provider mode.
- Hosting target type.
- Target App Service or Static Web App metadata.
- Explicit approval checkbox.

DNS Record Packet:

- Expected records.
- Provider-specific owner instructions.
- Copy/download packet action.
- Packet version history.

Validation:

- DNS expected vs observed.
- Apex/www readiness.
- Last checked time.
- Retry validation action gated to SuperAdmin.

Azure Binding/TLS:

- Hostname binding status.
- Managed certificate/TLS state.
- Runtime route proof state.
- Blocker messages.

Promote Canonical Domain:

- Shows old canonical domain and new canonical domain.
- Requires runtime proof.
- Requires confirmation.

Rollback/History:

- Binding timeline.
- Audit event list.
- Previous canonical/default host.
- Rollback action gated to explicit approval.

## Admin Shell Integration

`apps/admin/src/app/dashboard/layout.tsx` already supports role-filtered nav items. Add a SuperAdmin-only "Domains" item under Onboarding in a future implementation phase.

`apps/admin/src/app/dashboard/onboarding/page.tsx` already functions as a SuperAdmin-only readiness console. Add a Domains card/link there in V2.8.60T.

