# Rollback Notes

This cleanup did not write CMS data, MediaAsset data, theme/navigation records, Azure resources, Cloudflare resources, DNS, forms, email/Microsoft 365 settings, or Roller records.

If the local tooling change must be reverted, revert the change in:

```text
apps/ice-rink-web/scripts/snapshot-cms-content.mjs
```

Then rerun:

```powershell
cd apps/ice-rink-web
npm run export:static:ice:cms
```

No CMS rollback is required for this cleanup because no CMS writes occurred. Regenerating local static artifacts is enough to reapply or remove the public snapshot serialization behavior.

