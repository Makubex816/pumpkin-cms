# Universal Tenant Form Pipeline Standard

## Purpose

Every tenant form must have one tenant-scoped path from rendered UI to FormEntry readback.

## Required Model

Each tenant form must define:

- tenant id;
- form key/type;
- public or preview route;
- FormDefinition id/formKey;
- required fields;
- optional fields;
- hidden fields needed for tenant/site/form preservation;
- consent field and required status;
- honeypot/spam field;
- submit endpoint;
- FormEntry readback route;
- Admin UI visibility path;
- notification behavior classified without printing secret refs or recipient values.

## Submit Standard

Runtime submit must use one of:

- `POST /api/forms/{tenantId}/entries`
- `POST /api/forms/{tenantId}/submit/{type}`
- a tenant-specific adapter that forwards to one of those routes.

Successful live submit proof must use synthetic data only and include:

- `TEST DO NOT CONTACT`;
- `v2-8-61ol` or current phase marker;
- tenant id;
- timestamp;
- non-customer test email only if validation and safety policy permit it.

## Safety Gates

Do not run a successful live submit when:

- tenant API key is unavailable or would be printed;
- Admin/SuperAdmin readback auth is unavailable or would be printed;
- the submit path may email external client recipients and no owner-approved test recipient/suppression exists;
- the route would mutate anything beyond FormEntry/test audit metadata;
- the tenant is explicitly frozen.

## Preview Standard

Preview routes must not submit live forms.

Preview forms must either:

- render disabled/no-post; or
- route to a no-op that cannot create FormEntry records.

HTML should not include a live form `action` or `method=post` for preview-only review.

## Readback Standard

Every successful test submit must be read back through tenant-scoped Admin API or Admin UI.

Readback proof must record only:

- entry id;
- tenant id;
- form key/type;
- status/count delta;
- redacted marker fields;
- timestamp.

Do not copy full payload PII into repo docs.

## Isolation Standard

Proof must show:

- the entry appears under the intended tenant;
- the entry does not appear under another tenant;
- unauthenticated reads are rejected;
- TenantAdmin scope is respected where source and credentials allow it.

## DNS Relationship

Form readiness does not imply DNS readiness.

Production/custom-domain form proof requires a separate DNS/custom-domain approval and a no-regression run after cutover.
