# Deployment Target Options

Generated: 2026-06-05

## Option A: Standalone Azure Function Companion Endpoint

Use the hardened endpoint package as a narrow Azure Function endpoint for static form intake.

Future target:

```text
Function App: func-pumpkin-static-forms-staging
Route: /api/static-contact
Site scope: ice-rink-rentals only
Forward mode after verification approval: pumpkin-api
```

The existing staging docs also use `func-pumpkin-static-forms-staging` as the placeholder Function App name. Production can use a separately approved equivalent such as `func-pumpkin-static-forms-prod`.

Resources required later:

- Azure Function App or equivalent serverless endpoint
- Function runtime app settings
- Function storage/hosting resources as required by the selected Azure Functions plan
- monitoring/logging configuration
- server-side Pumpkin API credential storage

Deployment commands needed later:

- create or select the Function App
- create or confirm Function project scaffold
- configure app settings with placeholders approved out of band
- publish the Function App
- test `OPTIONS` and `POST`
- verify Pumpkin API persistence using approved test data

Pros:

- lowest implementation risk because the hardened package already exists and passes local tests
- keeps server-side credentials out of the static frontend
- works with Azure Static Web Apps, Azure Storage static hosting, or any other static host
- can be disabled independently from the static site

Cons:

- still requires a separately approved Azure deployment
- needs Function scaffold confirmation before publishing
- needs operational monitoring, rate-limit, and spam-control decisions

Email/Microsoft 365 dependency:

- none for no-email FormEntry persistence
- separate approval required before notification email sending

Rollback/disable:

- remove static build endpoint URL and verification flag, rebuild static output later under approval
- disable or restrict the Function App
- remove approved origins
- rotate server-side API credentials if needed

Recommendation:

Use this option first.

## Option B: Azure Static Web Apps API Function

Deploy the handler as an API function attached to a future Azure Static Web Apps staging or production resource.

Resources required later:

- Azure Static Web Apps resource
- attached API function configuration
- SWA deployment token or approved deployment workflow
- app settings or linked Function settings

Pros:

- colocates static hosting and API surface
- can simplify same-platform staging once SWA hosting is selected

Cons:

- couples the endpoint to SWA hosting choice
- less portable if the static site uses Azure Storage or another host
- still needs the same server-side secrets and verification

Email/Microsoft 365 dependency:

- none for no-email FormEntry persistence
- separate approval required before notification email sending

Rollback/disable:

- remove the SWA API route or restrict origins
- unset the public endpoint URL and verification flag before future static rebuilds

Recommendation:

Viable only if SWA is the approved static hosting target.

## Option C: Existing Pumpkin API Public Endpoint

Expose or reuse a hardened Pumpkin API endpoint directly from the static frontend.

Resources required later:

- a public API route approved for unauthenticated browser form intake
- CORS/origin allowlist
- spam and rate-limit controls
- server-side tenant routing
- safe persistence into `FormEntry`

Pros:

- keeps submissions close to the existing Pumpkin data model
- can avoid separate Function hosting

Cons:

- broadens the public API surface
- cannot expose Pumpkin API keys to the browser
- requires a separate security review before static frontend use

Email/Microsoft 365 dependency:

- none for no-email FormEntry persistence
- separate approval required before notification email sending

Rollback/disable:

- disable the public route or restrict origins
- unset endpoint URL and verification flag before future static rebuilds

Recommendation:

Do not use this as the first Ice static endpoint unless the API surface is separately hardened and approved.

## Option D: Delay Endpoint Deployment Until Email/Microsoft 365 Approval

Do not deploy a form endpoint until email, Microsoft 365, endpoint secrets, and static hosting are all approved together.

Resources required later:

- all endpoint resources from Option A or B
- email provider or Microsoft 365 configuration if notification sending is required

Pros:

- strongest no-action posture
- avoids partial operational ownership

Cons:

- keeps static validators blocked
- delays no-email FormEntry intake even though the hardened package can support it

Email/Microsoft 365 dependency:

- direct dependency if notification sending is bundled into the launch

Rollback/disable:

- not applicable until an endpoint exists

Recommendation:

Keep email separate. Do not block no-email FormEntry verification on Microsoft 365 work.
