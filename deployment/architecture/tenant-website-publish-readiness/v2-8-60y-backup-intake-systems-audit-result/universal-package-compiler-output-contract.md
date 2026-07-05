# Universal Package Compiler Output Contract

## Purpose

The Universal Package Compiler converts a quarantined frontend ZIP/package into a repo-safe normalized Pumpkin tenant package plus evidence.

## Output Folder

```text
compiled-package/
  compiler-manifest.json
  source-inventory.json
  framework-detection.json
  render-feasibility.json
  route-map.json
  media/manifest.json
  forms/form-map.json
  brand.json
  theme.json
  tenant-package/
  validation/
    package-validation-summary.json
    responsive-readiness.json
  owner-action-packet.md
  security/
    source-secret-scan-redacted.json
    excluded-files.json
```

## Required Manifest Fields

- `compilerVersion`
- `sourcePackageId`
- `sourcePackageSha256`
- `tenantId`
- `targetDomain`
- `runtimeMode`
- `conversionStatus`
- `readyForTenantCreation`
- `readyForIsolatedPreview`
- `readyForProductionCutover`
- `ownerActionRequired`
- `noLiveMutation`

## Conversion Status Values

- `converted_ready`
- `converted_with_warnings`
- `blocked_missing_owner_info`
- `blocked_render_failed`
- `blocked_mobile_responsive`
- `blocked_form_mapping_unclear`
- `blocked_secret_material_detected`
- `unsupported_framework`

## Security Rules

The compiler output must not contain:

- passwords;
- API keys;
- JWTs;
- auth cookies;
- connection strings;
- SAS values;
- deployment tokens;
- protected config file contents;
- raw source package secrets.

Secret requirements are represented as references, not values.

