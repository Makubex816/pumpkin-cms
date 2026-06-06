# Next Azure Setup Steps

Azure setup remains unapproved.

Do not create Azure resources, Cosmos resources, Blob containers, DNS records, Cloudflare changes, or deployments from the current state.

Recommended sequence:

1. Confirm or update Ice theme navigation so it only points to `/`, `/contact`, and `/service-areas`.
2. Review service-area claim language and fulfillment launch warnings in a separately authorized CMS content task if required.
3. Use the latest verified Ice CMS-backed static output as the staging candidate only after explicit approval.
4. Only after approval, create/configure/deploy the Azure Static Web App staging target.
5. Rerun staging validators and public staging route/media/form checks.
6. Keep DNS/Cloudflare cutover separate.

Completed prerequisite:

- approved CMS page metadata blockers for `home` and `service-areas` noindex and local social image fields are cleared
- media production URL readiness is yes
- contact form production readiness is yes for the approved endpoint/config
- official fresh CMS-backed export verification passed on 2026-06-06
- strict static output and staging validators passed with 42 files, 0 errors, 0 warnings

RollerRinkRentals.com remains paused.
