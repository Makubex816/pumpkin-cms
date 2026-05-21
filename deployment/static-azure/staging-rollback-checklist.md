# Staging Rollback And Backout Checklist

Use this if Azure Static Web Apps staging fails validation. This is staging-only; live domains should not be touched during Phase 6U execution prep.

## Immediate Backout

- Stop sharing the staging URL.
- Record the failed staging URL, timestamp, package run ID, and observed issue.
- Do not change Cloudflare live records.
- Do not purge Cloudflare.
- Do not publish or deploy the same package to production.

## Static Package Revert

If the issue is package-specific:

1. identify the last known good `.static-release-dry-runs/<runId>/` folder
2. validate it again locally
3. redeploy the previous staging package later using the same manual SWA process
4. record the package run ID and manifest path

CMS content does not need to change unless the issue came from CMS source content.

## Custom Domain Backout

If a staging custom domain was added:

- remove only the staging custom domain from Azure SWA if needed
- remove only the staging DNS record if Timothy approves
- keep root/apex and `www` live domains unchanged
- save screenshots or exported DNS records before and after changes

## Static Form Endpoint Backout

If form staging fails:

- remove the staging endpoint URL from the next static build configuration
- verify the static form shows the expected "not configured" inline error
- keep Lead Inbox records for audit; do not hard delete
- disable or stop using the Function staging endpoint if needed

## Documentation

Record:

- failing package run ID
- manifest path
- summary path
- staging URL
- validation failures
- whether form endpoint failed
- whether any DNS/staging custom domain changes were made
- next corrective action

## Things Not To Do

- do not change production DNS
- do not purge Cloudflare
- do not commit tokens
- do not delete CMS pages
- do not hard delete FormEntry records
- do not send production emails
