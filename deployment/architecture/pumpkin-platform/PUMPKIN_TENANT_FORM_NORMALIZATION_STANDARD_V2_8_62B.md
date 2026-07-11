# Pumpkin Tenant Form Normalization Standard V2.8.62B

## Purpose

This standard covers static packages whose forms currently use GET navigation, browser-local storage, or another non-Pumpkin flow. Normalization creates draft FormDefinition candidates only; it does not authorize submission or FormEntry creation.

## Source Accounting

Record both physical form tags and browser-resolved aliases. For this package, 62 physical tags plus 3 redirect-resolved aliases reconcile the accepted 65 forms across 38 routes. Alias accounting must be labeled and must not be presented as additional physical markup.

## Required Fields

Every candidate must include:

- source-backed fields with type, required state, options, route, and source instance;
- a required privacy/contact consent checkbox;
- an inert honeypot excluded from visible interaction;
- hidden `tenantId`;
- hidden `pageSlug`; and
- hidden `formKey`.

## Required Runtime Decisions

- Tenant-scoped endpoint: `/api/forms/{tenantId}/submit/{formKey}`.
- Recipient routing must be explicitly supplied and must not default to TenantAdmin by inference.
- Runtime submit credentials must use approved protected configuration and never enter the package.
- Consent copy, retention, notification behavior, abuse controls, and readback authorization require owner approval.

Preview fixtures must make submit controls inert and issue no POST. A live form proof requires a separately approved phase with exact submission counts and cleanup policy.
