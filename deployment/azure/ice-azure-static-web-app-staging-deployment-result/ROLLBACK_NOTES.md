# Rollback Notes

Generated: 2026-06-06

## Current Risk

The deployment affects only the isolated Azure Static Web Apps staging default hostname.

No production DNS, Cloudflare, custom domain, CMS, MediaAsset, Function App setting, email, Microsoft 365, or Roller state changed.

## Rollback Options

Because this was the first content deployment to the staging Static Web App, the lowest-risk rollback is to stop sharing or testing:

```text
https://happy-mud-0b375e20f.7.azurestaticapps.net
```

If a later approval requires removing content or deleting/disabling the staging resource, that must be approved as a separate Azure resource mutation.

For a future bad staging deployment, redeploy the last known-good artifact to the same staging Static Web App only after explicit deployment approval.

## Do Not Roll Back By Changing

- production DNS
- Cloudflare records/cache
- CMS content
- MediaAsset records
- Function App settings
- endpoint code
- Microsoft 365/email settings
- Roller state
