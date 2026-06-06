# Rollback Plan

Generated: 2026-06-06

No rollback was needed in this preflight because no key rotation or app setting changes were performed.

## Future Execution Rollback

If an approved rotation/update causes Function startup or endpoint failure:

1. Stop further changes.
2. Keep all keys and connection strings in memory only.
3. Rebuild the affected storage connection strings from the non-rotated storage account key.
4. Restore only:
   - `AzureWebJobsStorage`
   - `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
   - `AzureWebJobsDashboard`
5. Restart the Function App only if required.
6. Verify the Function App state and `/api/static-contact` dry-run/no-email behavior.
7. Document results without printing secret material.

## Disable Option

If remediation cannot safely complete, keep real email delivery blocked and do not configure Graph delivery credentials/settings.

