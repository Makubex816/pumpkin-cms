# Rollback Notes

Generated: 2026-06-06

No rollback was required. The Function App remained healthy after the settings were moved to `key2` and after `key1` was rotated.

## Future Rollback Options

If a later issue appears:

1. Keep all key/connection-string material in memory only.
2. Rebuild storage connection strings with the currently valid key.
3. Update only:
   - `AzureWebJobsStorage`
   - `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
   - `AzureWebJobsDashboard`
4. Restart only if required.
5. Validate `/api/static-contact` in dry-run/no-email mode.

Do not reintroduce the exposed pre-rotation `key1` value.

