# Deployment Auth Readiness Result

Classification: `blocked`.

Checked environment variable names only:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE_STAGING`: absent
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: absent
- `SWA_CLI_DEPLOYMENT_TOKEN`: absent
- `ICE_STAGING_SWA_DEPLOYMENT_TOKEN`: absent
- `AZURE_STATIC_WEB_APPS_API_TOKEN_ICE`: absent

`swa` CLI availability: absent on PATH.

No deployment token value was printed or exported. No protected config, `.env.local`, deployment token file, Key Vault secret, key/listKeys, connection string, or SAS was read or generated.

