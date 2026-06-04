# Next Azure Setup Steps

Azure setup remains blocked.

Do not create Azure resources, Cosmos resources, Blob containers, DNS records, Cloudflare changes, or deployments from the current state.

Recommended sequence:

1. Update or approve Ice theme navigation so it only points to `/`, `/contact`, and `/service-areas`.
2. Clear production media URL blockers in a separately authorized media/CMS task.
3. Configure and verify the static contact form endpoint in a separately authorized infrastructure task.
4. Review service-area claim language in a separately authorized CMS content task.
5. Rerun the Ice-only CMS static dry-run command.
6. Confirm strict production and staging validators pass with static output quality gates marked yes.
7. Only after validation, request authorization to create Azure Static Web App staging resources.
8. Keep DNS/Cloudflare cutover separate.

Completed prerequisite:

- approved CMS page metadata blockers for `home` and `service-areas` noindex and local social image fields are cleared

RollerRinkRentals.com remains paused.
