# Next Setup Sequence

1. Update static route expectations to the approved Ice route set: `/`, `/contact`, and `/service-areas`.
2. Update static validators and staging checklists to remove retired route expectations.
3. In a separately approved task, generate a fresh live CMS snapshot for Ice.
4. Validate the fresh CMS snapshot.
5. Prepare production media Blob/Cloudflare path.
6. Upload approved media binaries to Blob and verify checksums.
7. Update MediaAsset production metadata and public URLs after explicit approval.
8. Configure and deploy a staging-safe static contact form endpoint.
9. Generate a fresh static export and dry-run release package.
10. Validate the generated artifact, including route files, sitemap, robots, media URLs, preview route exclusion, and secret scans.
11. Create Azure Static Web App staging resources only after explicit approval.
12. Deploy the validated artifact to the Azure default staging host.
13. Review staging visually and test static form behavior.
14. Prepare DNS/Cloudflare cutover only after staging approval.

RollerRinkRentals.com remains paused throughout this sequence unless separately approved.

