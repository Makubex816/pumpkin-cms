# Party Pros Submit Key Setup Result

Result: not performed.

The deployed starter appsetting readback showed:
- `NEXT_PUBLIC_PUMPKIN_API_URL`: present.
- `PUMPKIN_API_URL`: present.
- `PUMPKIN_SITE_NAME`: present.
- `PUMPKIN_TENANT_ID`: not present in the filtered readback.
- `PUMPKIN_API_KEY`: not present in the filtered readback.

The source-supported tenant key creation path exists through the SuperAdmin-only tenant API key regeneration route.

OS did not call the regeneration route and did not set a Party Pros submit key because Admin FormEntry readback could not be prepared with the approved custom-header environment variables.

No secret value was printed or written.
