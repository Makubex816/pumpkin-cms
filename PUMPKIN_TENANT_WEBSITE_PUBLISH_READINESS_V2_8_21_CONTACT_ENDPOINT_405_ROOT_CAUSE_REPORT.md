# V2.8.21 Contact Endpoint 405 Root Cause Report

Date: 2026-06-25

## Phase Status

Status: complete, root cause classified, no local source remediation implemented.

Lane: V2.8 Tenant Website / Post-Release Contact Verification

Classification: contact_endpoint_405_root_cause_local_remediation_no_deploy_no_post

V2.8.21 reviewed the V2.8.20 live contact POST failure, inspected contact form source, static output, route manifests, static form endpoint scaffolding, build/package shape, and bounded read-only production method behavior for `https://iceskatingrinkrentals.com/api/contact`. No deploy and no live POST occurred.

## V2.8.20 Carryforward

V2.8.20 sent exactly one approved synthetic non-PII live POST:

- Endpoint: `https://iceskatingrinkrentals.com/api/contact`
- Trace ID: `v2-8-20-live-contact-20260625140126`
- Result: HTTP 405
- Body: empty
- Success flag: none
- Entry ID: none
- Retry count after sent POST: 0

V2.8.20 confirmed the contact page was live and the canonical public email `contact@iceskatingrinkrentals.com` was visible. Backend delivery remained pending operator confirmation.

## Contact Source Inventory

Reviewed contact frontend and API source:

- `apps/ice-rink-web/src/components/PageRenderer.tsx`
- `apps/ice-rink-web/src/components/blocks/PolishedBlocks.tsx`
- `apps/ice-rink-web/src/app/[...slug]/page.tsx`
- `apps/ice-rink-web/src/app/page.tsx`
- `apps/ice-rink-web/src/lib/render-mode.ts`
- `apps/ice-rink-web/src/lib/public-render-page.ts`
- `apps/ice-rink-web/src/app/api/contact/route.ts`
- `apps/ice-rink-web/src/data/ice-rink-recovered-pages.ts`
- `apps/ice-rink-web/src/config/sites.ts`

Findings:

- Runtime mode posts to `/api/contact`.
- Static mode posts to `NEXT_PUBLIC_STATIC_FORM_ENDPOINT` or compatibility aliases when configured.
- Static mode throws a user-facing inline error if no static endpoint is configured.
- The Next API route source defines a `POST` handler for `/api/contact`, but this is a Next runtime route, not a file in the static `out` artifact.
- The recovered Ice page metadata carries non-secret endpoint keys and recipient refs, not a public endpoint URL.

## Endpoint Definition

Runtime endpoint:

- Source route: `apps/ice-rink-web/src/app/api/contact/route.ts`
- Route path: `/api/contact`
- Method implemented: `POST`
- Behavior: resolves site by host, validates form data, creates a FormEntry payload, and forwards to Pumpkin API using server-side site/API configuration.

Static endpoint:

- Public build-time value: `NEXT_PUBLIC_STATIC_FORM_ENDPOINT`
- Compatibility aliases: `STATIC_FORM_ENDPOINT`, `NEXT_PUBLIC_STATIC_FORM_ACTION`, `STATIC_FORM_ACTION`
- Preferred static function path in docs/scaffold: `/api/static-contact`
- Deployable static function scaffold: `deployment/static-azure/forms/static-form-endpoint/`

## Static Output Analysis

Selected production artifact from V2.8.19H:

- `apps/ice-rink-web/.tmp/sanitized-static-build/ice-rink-rentals/sanitized_20260625063439/repo/apps/ice-rink-web/out`
- File count: 41
- Aggregate SHA-256: `a7adb1cb7f3779c6e3232fe0f5e65886de62cdb60e89dffb44ef3c470cba3119`

Artifact findings:

- Required route files for `/`, `/service-areas`, and `/contact` were present.
- No `out/api` directory was present.
- No static API/function handler for `/api/contact` was present in the deployed static artifact.
- `contact/index.txt` contained `renderMode` as `static`.
- `contact/index.txt` contained `staticFormEndpoint` as an empty string.
- `contact/index.txt` did not contain `/api/contact`.
- `contact/index.txt` did not contain `/api/static-contact`.

This means the deployed artifact itself did not define a live submit endpoint.

## API / Function Source Analysis

Next API source:

- `apps/ice-rink-web/src/app/api/contact/route.ts` is a Next runtime handler.
- It is suitable for runtime CMS mode and local/runtime Next hosting.
- It is not shipped by a static `output: export` deployment.

Static form function source:

- `deployment/static-azure/forms/static-form-endpoint/azure-function-static-contact.mjs`
- `deployment/static-azure/forms/static-form-endpoint/azure-function-adapter.mjs`
- `deployment/static-azure/forms/static-form-endpoint/contact-handler.mjs`

Function scaffold findings:

- The deployable Azure Function route is `static-contact`.
- The public function path is `/api/static-contact`.
- The function supports `OPTIONS` and `POST`.
- The deployable scaffold intentionally does not register deployed `/api/contact` compatibility.
- The local test server accepts `/api/contact` only for local compatibility.

## SWA Config Analysis

No `staticwebapp.config.json` file was found in the inspected repo paths excluding protected config, `node_modules`, and `.next`.

No source-level SWA route rule was found that would rewrite `/api/contact` to an external static form endpoint.

No local config evidence was found that a managed Functions API was included in the selected static artifact deployment.

No Azure metadata or app settings were mutated or inspected in V2.8.21.

## Production Method Check

Read-only production checks were limited to `https://iceskatingrinkrentals.com/api/contact`.

Results at `2026-06-25T18:44:51Z`:

| Method | Status | Body | Allow header |
| --- | ---: | --- | --- |
| GET | 404 | HTML 404 body | none |
| HEAD | 404 | none | none |
| OPTIONS | 404 | HTML 404 body | none |

V2.8.20 carryforward:

| Method | Status | Body |
| --- | ---: | --- |
| POST | 405 | empty |

Interpretation:

- The live host does not expose a normal API handler at `/api/contact`.
- There is no `Allow` header suggesting a deployed method-limited handler.
- The mixed 404/405 behavior is consistent with static host/API path handling, not a working contact backend.

## Root Cause Classification

Primary root cause:

- `static_export_excludes_api_route`
- `api_handler_missing_from_static_artifact`

Contributing root causes:

- `managed_functions_not_deployed`
- `bring_your_own_api_not_linked`
- `frontend_points_to_wrong_endpoint` for the V2.8.20 direct manual POST target, because the selected static artifact did not actually configure `/api/contact` as the static submit endpoint.

Not the primary root cause:

- `api_handler_present_but_method_not_allowed`
- `staticwebapp_config_route_misconfigured`

Reason:

- The Next source handler exists, but the selected static artifact does not include it.
- The deployable static function scaffold exists, but it is not deployed or linked by this phase and is designed for `/api/static-contact`, not `/api/contact`.
- The selected artifact had no public static endpoint URL configured.

## Local Remediation Result

No local source remediation was implemented.

Reason:

- A production-functional fix requires at least one separately approved endpoint/deployment/configuration action:
  - configure a real public static form endpoint URL at build time;
  - deploy or link the static form Azure Function;
  - provide server-side backend delivery settings;
  - optionally add an explicitly approved `/api/contact` compatibility route to the deployable function; and
  - redeploy the static site after endpoint configuration.

Those actions require deployment and/or protected/server-side settings and are outside V2.8.21.

Source-side readiness:

- The static form endpoint package is locally healthy.
- The Ice app has render-mode support for a static endpoint URL.
- The selected production artifact simply did not include an endpoint URL or API handler.

## Local Contact Validation

Checks run:

- Static form endpoint `npm run check`: pass.
- Static form endpoint `npm test`: pass.
- Ice static validator `npm run validate:static:ice`: pass with 34 existing warnings.
- Strict static output validator against selected V2.8.19H artifact: failed, including `blocked_endpoint_missing`.
- Strict staging package validator against selected V2.8.19H artifact: failed, including `blocked_endpoint_missing`.

Important validator note:

- The strict validators also reported legacy media-origin errors because they expect older media-origin policy. V2.8.19H explicitly approved existing Azure Blob media references for that release. For this phase, the relevant contact finding is that both strict validators classify the static form gate as blocked because the endpoint is missing and backend verification is missing.

## Isolated Staging Plan

Before any future production live POST retry:

1. Approve a separate remediation implementation phase.
2. Configure a real static form endpoint URL, preferably `/api/static-contact` on the approved Azure Function or equivalent public intake service.
3. Keep all Pumpkin API keys, Microsoft Graph credentials, recipient secrets, and provider config server-side only.
4. Build a sanitized static artifact with the public endpoint URL only.
5. Verify the artifact contains `renderMode: static` and the expected non-secret endpoint URL.
6. Deploy to isolated staging only after separate deployment approval.
7. Run isolated staging GET checks for the contact page.
8. Run isolated staging OPTIONS check for the static form endpoint.
9. Submit one isolated-staging synthetic POST only after explicit staging POST approval.
10. Verify response JSON contains success and a public-safe entry ID or confirmation.

## Live POST Retry Gate

No production live POST retry is approved in V2.8.21.

Future production retry prerequisites:

- Isolated staging remediation passes.
- Operator confirms backend delivery path without exposing secrets.
- A new trace ID is provided.
- Approved production live POST count is exactly 1.
- A new prompt explicitly approves one production POST and forbids retries after it is sent.

## Missing Values / Operator Actions

Missing or externally controlled items:

- Approved public static form endpoint URL.
- Confirmation whether the existing Azure Function endpoint should be `/api/static-contact`, `/api/contact`, or both.
- Server-side Pumpkin API forwarding configuration, if using Pumpkin FormEntry persistence.
- Server-side Microsoft Graph/email configuration, if using direct email delivery.
- Allowed origins for apex, `www`, and isolated staging hosts.
- Deployment approval for the static endpoint, if not already deployed.
- Deployment approval for rebuilt static site artifact after endpoint URL is configured.
- Backend delivery confirmation for V2.8.20 trace ID, if available.

No protected values were read to obtain these items.

## Boundary Confirmation

Confirmed:

- No deploy.
- No redeploy.
- No live contact form POST.
- No POST retry.
- No Azure mutation.
- No Azure Functions app creation or linking.
- No app settings mutation.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No protected config read.
- No `.env.local` read.
- No appsettings or local.settings secret read.
- No Key Vault secret query.
- No keys/listKeys.
- No connection string or SAS generation.
- No inbox or email provider login.
- No files staged.

## Files Created

- `PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_21_CONTACT_ENDPOINT_405_ROOT_CAUSE_REPORT.md`
- `deployment/architecture/tenant-website-publish-readiness/v2-8-21-contact-endpoint-405-root-cause-remediation-result/`

## Validation

Validation status: complete.

Final checks:

- `result-manifest.json` JSON parse: pass.
- Required package file count: pass, 21 of 21 files present.
- V2.8.21 package JS/MJS syntax check: not applicable, no JS/MJS files were created in the package.
- `git diff --check`: pass; emitted only non-failing line-ending warnings from the existing unrelated dirty worktree.
- Scoped trailing whitespace scan for the V2.8.21 report/package: pass.
- Scoped secret-like assignment scan for the V2.8.21 report/package: pass.
- Deploy/mutation command guard for the V2.8.21 report/package: pass.
- Protected/generated/raw changed-path guard: pass.
- Static form endpoint `npm run check`: pass.
- Static form endpoint `npm test`: pass.
- Ice static validator `npm run validate:static:ice`: pass with 34 existing warnings.
- Strict selected-artifact static output validator: expected fail, `staticFormGate.status = blocked_endpoint_missing`.
- Strict selected-artifact staging package validator: expected fail, `staticFormGate.status = blocked_endpoint_missing`.
- Final staged-file check: pass, no files staged.

See `deployment/architecture/tenant-website-publish-readiness/v2-8-21-contact-endpoint-405-root-cause-remediation-result/validation-summary.md` for the packaged validation summary.

## Next Approval

The next approval is folded into:

- `deployment/architecture/tenant-website-publish-readiness/v2-8-21-contact-endpoint-405-root-cause-remediation-result/next-phase-prompt.md`

## Exact-Path Commit Instructions

```powershell
git add PUMPKIN_TENANT_WEBSITE_PUBLISH_READINESS_V2_8_21_CONTACT_ENDPOINT_405_ROOT_CAUSE_REPORT.md
git add deployment/architecture/tenant-website-publish-readiness/v2-8-21-contact-endpoint-405-root-cause-remediation-result/
git commit -m "Classify V2.8.21 contact endpoint root cause"
```
