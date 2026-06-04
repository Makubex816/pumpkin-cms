# Next Setup Sequence

1. Request authorization for a CMS metadata update to remove noindex from approved production-intended Ice pages.
2. Request authorization for media production URL publication.
3. Publish approved media binaries to the planned Blob/Cloudflare path in a separate task.
4. Update MediaAsset production URLs in a separate CMS/media task.
5. Deploy and validate a staging-safe static contact endpoint in a separate infrastructure task.
6. Generate a fresh Ice CMS snapshot.
7. Run snapshot validation and confirm old routes are absent.
8. Run a static CMS dry run and inspect the manifest.
9. Validate output/staging package gates.
10. Create Azure Static Web App staging resources only after explicit approval.
11. Deploy to Azure staging only after explicit approval.
12. Keep DNS/Cloudflare production cutover separate.

RollerRinkRentals.com remains paused.

