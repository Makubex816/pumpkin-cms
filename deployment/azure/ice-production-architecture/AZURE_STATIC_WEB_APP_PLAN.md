# Azure Static Web App Plan

Azure Static Web App hosts the public generated website/app shell for IceSkatingRinkRentals.com.

Approved current CMS routes:

- `/`
- `/contact`
- `/service-areas`

Static generation requirements:

- Generate only from approved/live CMS content.
- Exclude draft-only pages from production output.
- Keep draft preview protected and out of public static output.
- Fail static generation if a required live route is missing.
- Fail static generation if any production page contains localhost media URLs.
- Fail static generation if any required production MediaAsset `publicUrl` is missing.
- Fail static generation if any required media remains unresolved.
- Fail static generation if `contactus@` appears in public output.

Deployment requirements:

- Deploy to Azure staging/default domain first.
- Review staging before custom domain cutover.
- Keep the previous static release package for rollback.
- Do not cut over Cloudflare DNS until staging is approved.

This package did not run static generation and did not deploy to Azure.
