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
- Rotated key setting: `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`.
- Appsetting values printed: no.
- Azure redacted appsettings warning only: yes.

Rollback:

After isolated verification returned HTTP 400, the isolated Static Web App key binding was restored.
