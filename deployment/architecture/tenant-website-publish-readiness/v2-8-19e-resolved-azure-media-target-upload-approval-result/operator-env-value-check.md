# Operator Env Value Check

The optional non-secret `PUMPKIN_ICE_MEDIA_*` environment variables were present in PowerShell and available to Node. Values were checked for presence, exact match against the resolved target metadata, placeholder shape, and secret-like shape.

The check did not print deployment tokens, account keys, connection strings, SAS values, or protected config.

| Name | Present | Matches resolved value | Placeholder-shaped | Secret-shaped |
| --- | --- | --- | --- | --- |
| `PUMPKIN_ICE_MEDIA_TARGET_PROVIDER` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_TARGET_ACCOUNT_OR_HOST` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_TARGET_RESOURCE_GROUP` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_TARGET_CONTAINER` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_TARGET_PREFIX` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_PUBLIC_BASE_URL` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_AUTH_MODE` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_IDENTITY_OR_SESSION_TYPE` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_READBACK_METHOD` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_CACHE_CONTROL` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_OVERWRITE_POLICY` | true | true | false | false |
| `PUMPKIN_ICE_MEDIA_FINAL_TARGET_CONFIRMATION` | true | true | false | false |

Result: all expected non-secret target variables are present, non-placeholder-shaped, non-secret-shaped, and match the resolved V2.8.19E target.
