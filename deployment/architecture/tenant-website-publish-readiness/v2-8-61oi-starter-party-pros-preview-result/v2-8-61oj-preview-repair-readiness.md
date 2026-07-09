# V2.8.61OJ Preview Repair Readiness

Recommended next phase: V2.8.61OJ should repair the preview gap before any public publish or customer-facing proof.

Minimum OJ objectives:

1. Keep the starter host shared and avoid making it Party Pros-only unless separately approved.
2. Add or approve a read-only preview path for Party Pros home/contact/service-areas.
3. Choose exactly one preview data source:
   - live CMS unpublished read route with secure server-side auth, or
   - compiled-package fixture adapter, or
   - static generated preview fixture from the compiled package.
4. Render Party Pros pages without publishing pages.
5. Render `party-pros-quote-request` without submitting the form.
6. Keep starter `/admin` tenant-local and exclude platform controls.
7. Run bounded GET-only runtime no-regression without Airstrip.

Recommended blockers to resolve in OJ:

- No source-supported unpublished preview route.
- No source-supported compiled package adapter.
- No tenant binding on the live starter host.
- Current runtime page fetch is published-only.
- Party Pros pages are unpublished.

Recommended approvals before any live preview binding:

- Whether OJ may edit starter source.
- Whether OJ may set tenant-binding appsettings on the existing starter host.
- Whether OJ may use a secure tenant API key handoff without printing the value.
- Whether OJ may deploy the repaired starter build.

Still separate from OJ unless owner approves:

- DNS/custom-domain action.
- Page publication.
- Contact POST.
- Form submission.
- Customer-facing POST proof.
- Airstrip action.

