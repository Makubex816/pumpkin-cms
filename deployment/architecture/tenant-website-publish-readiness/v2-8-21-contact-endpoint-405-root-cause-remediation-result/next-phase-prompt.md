# Next Phase Prompt: V2.8.22 Static Contact Endpoint Remediation Implementation Approval

Use this prompt only after V2.8.21 is reviewed.

## Proposed Approval

Approve V2.8.22 Static Contact Endpoint Remediation Implementation Planning only.

The goal is to choose and prepare the static contact endpoint remediation path for IceSkatingRinkRentals.com after V2.8.21 classified the `/api/contact` 405 root cause. This phase may implement source-only changes needed for the chosen endpoint path and prepare an isolated staging deployment packet, but it must not deploy or send a live production POST unless separately approved.

## Carryforward

V2.8.21 found:

- Source Next route `/api/contact` exists only for runtime Next hosting.
- Static export excluded the API route.
- Selected production artifact had no `out/api` directory.
- Selected production artifact had `renderMode: static`.
- Selected production artifact had empty `staticFormEndpoint`.
- Static function scaffold exists for `/api/static-contact`.
- Production GET/HEAD/OPTIONS to `/api/contact` returned 404.
- V2.8.20 POST to `/api/contact` returned 405.

## Approved

- Review V2.8.21 result package.
- Choose static endpoint path: `/api/static-contact`, `/api/contact`, or both.
- Implement source-only endpoint compatibility if explicitly selected.
- Update validators or release gates if explicitly selected.
- Run local static form endpoint tests.
- Run local static build/validation with a public endpoint URL only if operator supplies it in process env.
- Prepare isolated staging deployment and staging POST validation packet.

## Not Approved

- No production live contact form POST.
- No staging contact form POST unless separately approved.
- No deploy or redeploy.
- No Azure mutation.
- No Azure Functions app creation or linking.
- No app settings mutation.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No sitemap submission.
- No URL Inspection API.
- No Google Indexing API.
- No deployment token reset/list/print/export/use.
- No protected config read.
- No `.env.local` read/print/copy/move/rename/parse/source/modify.
- No appsettings secret read.
- No local.settings secret read.
- No Key Vault secret query.
- No keys/listKeys action.
- No connection string generation.
- No SAS generation.
- No inbox or email provider login.

## Required Outputs

- V2.8.22 root report.
- V2.8.22 result package.
- Endpoint path decision record.
- Source implementation result or blocker.
- Local validation result.
- Isolated staging deployment approval packet.
- Staging POST gate prompt.
- Future production live POST retry gate prompt.
- Exact-path commit instructions only.
