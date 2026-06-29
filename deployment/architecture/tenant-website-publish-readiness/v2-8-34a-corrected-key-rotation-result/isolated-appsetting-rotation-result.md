# Isolated Appsetting Rotation Result

Target:

- Static Web App: `swa-ice-static-isolated-staging`.
- Resource group: `rg-ice-static-staging`.

Settings set:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOWED_ORIGINS`

Result:

- Isolated appsettings set: yes.
- Propagation wait: 20 seconds.
- Azure appsettings warning was redacted: yes.
- Secret values printed: no.
