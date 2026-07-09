# V2.8.61OJ Starter Preview Adapter Report

Phase status: complete.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `starter_preview_adapter_party_pros_unpublished_preview_live_proven_one_starter_redeploy_no_dns_no_post`.

## Carryforward

V2.8.61OH was committed at `f1d92953`.

V2.8.61OI was committed at `13710ee9`. OI proved the starter live host was available, starter `/admin` remained tenant-local, and Party Pros preview was blocked by a source/runtime adapter gap rather than by host availability.

Before resuming OJ, the preexisting OJ working-tree source changes were reviewed and preserved. OI scoped files stayed clean.

## Source Result

OJ implements a generic preview adapter in `apps/starter-app`:

- Server-side fixture loader for `preview-fixtures/{tenantId}/preview.json`.
- App Router route `/preview/[tenantId]/[[...slug]]`.
- Preview-mode rendering through the existing `PageRenderer`.
- Preview-safe no-POST behavior for `formBlock` and Contact blocks.

The adapter is tenant-id driven and does not require `PUMPKIN_API_KEY`, appsetting mutation, privileged API credentials, Party Pros page publish, or Party Pros record mutation.

## Fixture And Build

Party Pros fixture was regenerated outside the repo from the approved compiled package and prior backup shape. Uploaded package code was not executed.

- Tenant: `party-pros-philadelphia`
- Pages: `home`, `contact`, `service-areas`
- FormDefinition: `party-pros-quote-request`
- Theme: `party-pros-orange-slate-v1`
- Fixture bytes: 29587
- Fixture SHA-256: `9a5d8244c20f7c225ee572888b69ac5b0fc66b3ec67991c3c7e8cacdf7a0bdf6`
- Repo staging: none

Starter `npm run type-check` passed.

Starter `npm run build` passed with the known `pumpkin-ts-models` `fs` warning.

Local standalone proof passed for the default starter route and all three Party Pros preview routes, including preview-disabled form text.

## Redeploy

The single approved starter redeploy was completed against:

`app-pumpkin-starter-preview-centralus-001`

Deployment package:

- Bytes: 5844992
- Entries: 1825
- SHA-256: `cbcc2f551dec154bf8bb07e779d1637a9241bb377f8de8554920b2d7210d7390`
- Included `server.js`, `.next/static`, `public`, and Party Pros fixture.
- Zip entries used normalized forward slashes.

Azure deployment result:

- Deployment id: `28d1bd67-834d-4710-a295-e9abcb4b1601`
- Status: `RuntimeSuccessful`
- Successful instances: 1
- Failed instances: 0

No second deployment was run.

## Live Proof

Starter default/admin routes:

| Route | Status | Proof |
| --- | ---: | --- |
| `/` | 200 | starter default page served |
| `/admin/login` | 200 | login page served |
| `/admin` | 307 | redirected to `/admin/login` |

Party Pros unpublished preview routes:

| Route | Status | Party Pros content | Preview disabled marker | Quote form marker |
| --- | ---: | --- | --- | --- |
| `/preview/party-pros-philadelphia` | 200 | yes | yes | yes |
| `/preview/party-pros-philadelphia/contact` | 200 | yes | yes | yes |
| `/preview/party-pros-philadelphia/service-areas` | 200 | yes | yes | yes |

Starter appsetting name-only readback remained unchanged:

- `NEXT_PUBLIC_PUMPKIN_API_URL`
- `NEXT_TELEMETRY_DISABLED`
- `PORT`
- `PUMPKIN_API_URL`
- `PUMPKIN_SITE_NAME`
- `WEBSITES_PORT`

## Boundary

Runtime no-regression passed 14/14 GET-only checks without Airstrip.

No Pumpkin API deploy, standalone Admin UI deploy, Airstrip action, Ice action, new Azure resource, appsetting mutation, DNS/custom-domain action, Party Pros publish/mutation, contact POST, form submission, customer-facing POST proof, storage keys/listKeys/SAS, protected config read, secret/token/cookie print, git staging, or all-path git add occurred.

## Result Docs

Repo-safe result package:

`deployment/architecture/tenant-website-publish-readiness/v2-8-61oj-starter-preview-adapter-result/`

Durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_PREVIEW_ADAPTER_V2_8_61OJ.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_UNPUBLISHED_PREVIEW_PROOF_V2_8_61OJ.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_FORM_PREVIEW_NO_POST_V2_8_61OJ.md`

## Exact Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_61OJ_STARTER_PREVIEW_ADAPTER_REPORT.md deployment/architecture/tenant-website-publish-readiness/v2-8-61oj-starter-preview-adapter-result deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_PREVIEW_ADAPTER_V2_8_61OJ.md deployment/architecture/pumpkin-platform/PUMPKIN_PARTY_PROS_UNPUBLISHED_PREVIEW_PROOF_V2_8_61OJ.md deployment/architecture/pumpkin-platform/PUMPKIN_STARTER_FORM_PREVIEW_NO_POST_V2_8_61OJ.md apps/starter-app/src/lib/preview-fixtures.ts apps/starter-app/src/app/preview/[tenantId]/[[...slug]]/page.tsx apps/starter-app/src/components/PageRenderer.tsx apps/starter-app/src/components/ContactFormBlock.tsx
git commit -m "Add V2.8.61OJ starter preview adapter"
```
