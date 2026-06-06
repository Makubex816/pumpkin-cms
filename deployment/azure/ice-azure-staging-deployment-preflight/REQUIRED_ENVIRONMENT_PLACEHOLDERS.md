# Required Environment Placeholders

Generated: 2026-06-06

## Local Rebuild/Validation Environment

Use names only in docs. Do not print secret values.

Required for a fresh CMS-backed rebuild:

```text
PUMPKIN_API_URL=<Pumpkin API base URL>
ICE_RINK_RENTALS_API_KEY=<server-side Ice tenant API key>
ICE_RINK_RENTALS_TENANT_ID=ice-rink-rentals
PUMPKIN_ADMIN_JWT=<admin JWT for read-only snapshot/export>
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
STATIC_FORM_ENDPOINT_VERIFIED=true
```

The endpoint URL is public by design. API keys, JWTs, and credentials must remain outside repo files and reports.

## Azure Static Web Apps Deployment Placeholder

For a future manual SWA deployment:

```text
ICE_STAGING_SWA_DEPLOYMENT_TOKEN=<Azure Static Web Apps deployment token>
```

For a future GitHub Actions deployment:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING=<Azure Static Web Apps deployment token stored in GitHub secrets>
```

Do not print, commit, paste, or store token values in docs.

## SWA Build Settings

Use prebuilt static output. The future deploy should not run a cloud build that needs Pumpkin API credentials.

SWA action/CLI intent:

```text
app_location=apps/ice-rink-web/.static-artifacts/ice-rink-rentals/out
output_location=
skip_app_build=true
```

## Static Form Endpoint

Current approved public endpoint:

```text
NEXT_PUBLIC_STATIC_FORM_ENDPOINT=https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

No Function App setting changes are approved in this preflight.

After a SWA default hostname exists, browser submissions from that hostname may require a separate Function setting approval to add the SWA default hostname to the endpoint allowed origins.

Possible future setting name to review by name only:

```text
STATIC_FORM_ALLOWED_ORIGINS=<existing approved origins plus Azure default staging host if approved>
```

Do not change it without explicit approval.

## Not Required In Static Output

These must not appear in the deployed static artifact:

- `PUMPKIN_API_URL`
- `ICE_RINK_RENTALS_API_KEY`
- `PUMPKIN_ADMIN_JWT`
- Azure deployment tokens
- Cloudflare tokens
- Microsoft Graph credentials
- connection strings
