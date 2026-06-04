# Setup Sequence

This setup sequence is planned only. It was not executed by this package.

1. Confirm production architecture lock approval.
2. Prepare Azure resource naming plan.
3. Prepare Cosmos DB production database/container plan.
4. Prepare Blob Storage media container/path plan.
5. Prepare Azure Static Web App staging/default domain plan.
6. Prepare Cloudflare DNS/CDN/cache plan.
7. Prepare Microsoft 365/contact form production integration plan.
8. Prepare secret/config plan using Azure app settings or Key Vault.
9. Publish approved media binaries to Blob after explicit authorization.
10. Update approved MediaAsset metadata with production Blob/CDN URLs after explicit authorization.
11. Run static generation from approved live CMS only after explicit authorization.
12. Validate generated static package.
13. Deploy to Azure staging after explicit authorization.
14. Review staging.
15. Configure Cloudflare/custom domains after explicit authorization.
16. Cut over DNS after explicit authorization.
17. Retain rollback package and post-launch verification notes.

RollerRinkRentals.com remains paused and untouched.
