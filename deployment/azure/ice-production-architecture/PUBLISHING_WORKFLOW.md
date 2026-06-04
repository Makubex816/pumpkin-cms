# Publishing Workflow

Manual launch workflow:

1. Edit/preview in Pumpkin.
2. Approve live CMS page.
3. Validate CMS live pages.
4. Publish approved media to Blob.
5. Update MediaAsset production public URLs.
6. Generate static package from live CMS.
7. Validate static package.
8. Deploy to Azure staging/default domain.
9. Review staging.
10. Configure Cloudflare/custom domains after staging approval.
11. Cut over DNS.
12. Retain rollback package.

Approval gates:

- CMS live approval is complete for `/`, `/contact`, and `/service-areas`.
- Media publish to Blob remains a future gate.
- Static generation remains a future gate.
- Azure staging deploy remains a future gate.
- Cloudflare/custom domain cutover remains a future gate.
- Production indexing remains a future gate.

Publishing must remain manual and approval-gated for launch.
