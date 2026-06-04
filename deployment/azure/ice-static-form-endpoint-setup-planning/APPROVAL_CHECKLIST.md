# Approval Checklist

Generated: 2026-06-04

## Planning Approval Status

Planning package creation: approved.

Static form endpoint execution: not approved.

## Required Future Approvals

Before endpoint deployment:

- approve endpoint architecture
- approve endpoint host/provider
- approve function/app naming
- approve allowed origins
- approve runtime app settings

Before frontend configuration:

- approve public endpoint URL
- approve static build env var name
- confirm the value contains only a URL

Before verification:

- approve local/staging test payloads
- approve Lead Inbox or destination verification
- approve setting `STATIC_FORM_ENDPOINT_VERIFIED=true`

Before email/Microsoft 365:

- approve any test email
- approve Microsoft 365 settings access
- approve notification routing

Before readiness changes:

- strict validators must pass for form endpoint gates
- contact form production readiness may be marked `yes` only after verification passes

## Explicitly Not Approved In This Pass

- endpoint deployment
- Azure resource creation
- production env var setting
- `STATIC_FORM_ENDPOINT_VERIFIED=true`
- email sending
- Microsoft 365 settings changes
- CMS writes

