# Next Azure Setup Steps

Azure setup remains blocked.

Do not create Azure resources, Cosmos resources, Blob containers, DNS records, Cloudflare changes, or deployments from the current state.

Recommended sequence:

1. Clear CMS page metadata blockers for `home` and `service-areas` noindex.
2. Update or approve Ice theme navigation so it only points to `/`, `/contact`, and `/service-areas`.
3. Clear production media URL blockers in a separately authorized media/CMS task.
4. Configure and verify the static contact form endpoint in a separately authorized infrastructure task.
5. Review service-area claim language in a separately authorized CMS content task.
6. Rerun the Ice-only CMS static dry-run command.
7. Confirm fresh static output is exactly `/`, `/contact`, and `/service-areas`.
8. Only after validation, request authorization to create Azure Static Web App staging resources.
9. Keep DNS/Cloudflare cutover separate.

RollerRinkRentals.com remains paused.
