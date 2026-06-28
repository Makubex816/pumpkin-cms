# Fallback Diagnosis Result

Fallback classification: `provider_store_access_failed`.

Ruled out for this phase:

- `admin_password_invalid`: not proven. Source would return 401 for password mismatch; logs show provider exception and 500.
- `missing_admin_user_seed`: not proven. Source/logs do not show a 401 or missing user path; they show provider connection-string failure.
- `jwt_support_setting_missing`: not the active logged failure. JWT support settings remain source-discovered, but the current 500 occurs in store access.
- `admin_auth_still_insufficient`: not reached because no bearer token was issued.

Exact blocker:

The live app's provider/store configuration is not usable by the login path. The diagnostic exception is `System.ArgumentException: The connection string is missing a required property: AccountEndpoint`.

Required next move:

Run a separately approved provider-store binding/repair phase that can validate and set the production database provider settings without appsettings list/show or secret disclosure.

