# Schema Loading Plan

## Schema Locations

Primary schemas live under:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-spec/schemas/
```

Known schemas:

- `tenant.schema.json`
- `owner-contact.schema.json`
- `site.schema.json`
- `route.schema.json`
- `page.schema.json`
- `media-asset.schema.json`
- `form.schema.json`
- `seo.schema.json`
- `theme.schema.json`
- `redirect.schema.json`
- `approval.schema.json`
- `manifest.schema.json`
- `validation-report.schema.json`
- `support-packet.schema.json`

Deployment profile schema lives under:

```text
deployment/architecture/multi-tenant-onboarding-system/deployment-profile-registry/deployment-profile.schema.json
```

## Registry

The future `schema-loader` should build a registry keyed by:

- schema role, such as `tenant`, `site`, `page`, or `validation-report`
- `$id`
- `schemaVersion`

## Version Handling

Rules:

- every package JSON file must declare `schemaVersion`
- Phase 2A supports only `1.0.0`
- unsupported schema versions produce status `failed`
- missing schema version produces status `failed`
- schema version mismatch across package files produces a cross-file finding

## `additionalProperties` Strategy

Current schemas use strict `additionalProperties: false` for the core package. Future implementation should preserve strict mode by default.

If a future extension adds fields, it must do so through an extension-aware schema registry, not by weakening core validation.

## Extension Schema Handling

Phase 2A must make one of two choices before implementation acceptance:

- validate extension manifests, permission declarations, and migration schemas when extension files are present
- mark extension validation as `deferred` or `blocked` with a stable report finding and a clear follow-up owner

It must not silently accept unknown extension fields by loosening the core schemas.

## Example Validation

The future validator should validate example templates under:

```text
deployment/architecture/multi-tenant-onboarding-system/import-package-spec/templates/
```

Examples are documentation fixtures only until copied into a formal test fixture folder during implementation.

## Error Mapping

Raw JSON Schema errors must be converted into friendly findings:

- file path
- JSON pointer or field name
- short owner-facing message
- operator detail
- severity
- stable error code
- next action

Example mapping:

```text
raw: must have required property 'tenantId'
friendly: tenant.json is missing tenantId. Add the tenant ID from the intake form, for example example-event-rentals.
```
