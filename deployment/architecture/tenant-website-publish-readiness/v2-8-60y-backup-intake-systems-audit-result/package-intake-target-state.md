# Package Intake Target State

## Product Shape

The target is a non-technical Tenant Onboarding Wizard that accepts a frontend ZIP/package and turns it into either:

- a ready-to-onboard Pumpkin tenant package; or
- a clear owner action packet explaining what is missing, unsafe, or ambiguous.

## Required Flow

1. Upload package.
2. Quarantine package in ignored/protected storage.
3. Inventory files and checksums.
4. Classify framework/runtime mode.
5. Detect protected config and secret-like material.
6. Build/render safely in a copied workspace when possible.
7. Discover routes/pages.
8. Discover media and generate manifest.
9. Discover forms/contact/lead flows and map to FormDefinition.
10. Discover brand/theme.
11. Normalize tenant ID, domain, users, publish, monitoring, and validation modules.
12. Produce V1 Pumpkin package.
13. Validate package schemas and cross-file consistency.
14. Run responsive/mobile QA before isolated proof, production deploy, or custom-domain cutover.
15. Produce owner action packet if exact conversion is blocked.

## Supported Modes

- `static-html-ready`
- `static-build-output-ready`
- `source-build-renderable`
- `pumpkin-package-ready`
- `hybrid-next-server-required`
- `unsupported-needs-owner-input`

## Required Output States

- Uploaded.
- Scanning.
- Needs missing info.
- Can preview.
- Needs repair.
- Ready for isolated preview.
- Ready for tenant creation.
- Ready for production cutover.
- Blocked: mobile layout issue.
- Blocked: missing media.
- Blocked: missing admin email.
- Blocked: form mapping unclear.

