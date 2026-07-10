# V2.8.61OSB Party Pros Media Render Report

Status: complete.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `party_pros_image_media_rendering_repair_no_form_post_no_airstrip`.

Carryforward:
- V2.8.61OSRA is committed at `fd13e767`.
- OSRA form E2E remains blocked by missing secure handoff values.
- OSB did not retry form submission.

Diagnosis:
- Baseline custom-domain routes returned HTTP 200 but rendered 0 image tags, 0 CSS image URLs, and 0 blob URLs.
- Party Pros blobs are publicly readable when addressed with the actual preserved source-relative path `party-pros-philadelphia/assets/img/...`.
- MediaAsset records are carried forward from V2.8.61OF/ODR: 627 records and 627 blobs.
- Backed-up Party Pros page records and the deployed starter fixture had empty image/media render fields.
- Root cause: fixture/page media slot omission, not blob access, Next image config, or block renderer inability to render images.

Repair:
- `apps/starter-app/src/components/PageRenderer.tsx` now generically hydrates nested `content.media.publicUrl` or `content.media.url` into renderable block image fields for Hero, PrimaryCTA, CardGrid, and HowItWorks blocks.
- `apps/starter-app/src/lib/host-tenant-routing.ts` keeps the built-in Party Pros route no-post by default and lets configured routes override built-ins in a separately approved future phase.
- A bundle-only Party Pros fixture was generated outside the repo with tenant-scoped public blob URLs.
- Starter App Service was redeployed exactly once.

Deploy:
- Target: `app-pumpkin-starter-preview-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deployment id: `1e01000c-4c7e-4b8a-b86c-8b29c95fe9c1`.
- Result: `RuntimeSuccessful`.
- Successful instances: 1.
- Failed instances: 0.

Proof:
- Party Pros custom-domain routes returned HTTP 200 after repair.
- Home rendered 9 image tags.
- Contact rendered 6 image tags and a disabled/no-post form.
- Service areas rendered 6 image tags, including nested source-relative blog media paths.
- Representative blob image URLs returned HTTP 200.
- Browser QA covered 24 route/viewport checks with no broken images, no horizontal overflow, no failed browser requests, and no POST forms.
- Runtime no-regression passed 23/23 GET-only checks.

Security and boundaries:
- No form submission.
- No contact POST.
- No customer-facing POST proof.
- No FormEntry mutation.
- No Party Pros CMS mutation.
- No media upload/delete.
- No storage keys/listKeys/SAS.
- No Pumpkin API deploy.
- No Admin UI deploy.
- No Ice deploy or mutation.
- No DNS, registrar, nameserver, hostname, or TLS mutation.
- No Airstrip action or probe.
- No secret/token/cookie/API key was printed.
- No files were staged.

Files created or modified:
- `apps/starter-app/src/components/PageRenderer.tsx`
- `apps/starter-app/src/lib/host-tenant-routing.ts`
- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OSB_PARTY_PROS_MEDIA_RENDER_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-61osb-party-pros-media-render-result/`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_MEDIA_RENDERING_REPAIR_V2_8_61OSB.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_IMAGE_MAPPING_PROOF_V2_8_61OSB.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_MEDIA_RENDERING_STANDARD_V2_8_61OSB.md`

Next approval:
- Folded into `deployment/architecture/tenant-website-publish-readiness/v2-8-61osb-party-pros-media-render-result/next-phase-prompt.md`.

Exact-path commit instructions:

```powershell
git add -- PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OSB_PARTY_PROS_MEDIA_RENDER_REPORT.md `
  apps/starter-app/src/components/PageRenderer.tsx `
  apps/starter-app/src/lib/host-tenant-routing.ts `
  deployment/architecture/tenant-website-publish-readiness/v2-8-61osb-party-pros-media-render-result `
  deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_MEDIA_RENDERING_REPAIR_V2_8_61OSB.md `
  deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_IMAGE_MAPPING_PROOF_V2_8_61OSB.md `
  deployment/architecture/pumpkin-platform/PUMPKIN_TENANT_MEDIA_RENDERING_STANDARD_V2_8_61OSB.md

git commit -m "Repair Party Pros media rendering"
```
