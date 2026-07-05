# Pumpkin Tenant Onboarding Responsive Guardrails V2.8.60V

Status: active for future tenant package conversion.

## Purpose

Mobile responsive quality is now a required onboarding gate for converted tenant public outputs. A tenant package may pass data validation, but it must not proceed to isolated proof, production default-host proof, custom-domain cutover, DNS, or indexing until responsive browser proof is complete.

## Required Matrix

Every new or updated package must include `validation/responsive-routes.json` with these viewports:

| Label | Size |
| --- | --- |
| small-mobile | 360x800 |
| iphone-standard | 375x812 |
| modern-mobile | 390x844 |
| large-mobile | 414x896 |
| large-modern-mobile | 430x932 |
| tablet | 768x1024 |
| desktop | 1440x1200 |

## Required Checks

- `document.documentElement.scrollWidth` and body scroll width must not exceed viewport/client width by more than 2px.
- No horizontal mobile scrollbar.
- Header/nav must fit or collapse.
- Primary CTA must remain visible and tappable.
- Hero and section copy must not clip horizontally.
- Cards, grids, forms, media, and repeated content must remain inside the viewport.
- Missing image count must be zero.
- Console errors and failed requests must be zero or explicitly documented as non-blocking.
- Responsive proof must not submit forms or perform contact POSTs.

## Route Selection

At minimum, test `/`. Also test the main contact, booking, request, package, service, or conversion route when present, plus a representative content route. For large route maps, test the homepage, all critical conversion routes, and a representative sample before any production or cutover approval.

## Tooling

Use:

```powershell
node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/check-responsive-output.mjs `
  --base-url https://example-preview-host `
  --routes-file deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/examples/blank-tenant-template/validation/responsive-routes.json `
  --out .tmp/tenant-onboarding/<tenantId>/responsive-proof.json
```

Screenshots are opt-in only. If created, they must remain outside committed paths unless a later phase explicitly approves screenshot evidence.

## Phase Boundary

This standard is read-only. It does not approve tenant creation, deploy, DNS, indexing, content mutation, media upload, form submission, appsetting mutation, storage keys, SAS, or secret reads.
