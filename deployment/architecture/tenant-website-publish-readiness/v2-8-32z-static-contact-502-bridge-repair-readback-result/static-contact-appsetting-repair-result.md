# Static Contact Appsetting Repair Result

Repair performed:

- Set `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY` on the approved Static Web App to the secure normalized value.

Target:

- Static Web App: approved secure-file target.
- Resource group: approved secure-file target.

Command result:

- `az staticwebapp appsettings set`: exit code 0.
- Azure CLI output redacted app settings.

Settings not changed:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `STATIC_FORM_ALLOWED_SITE_KEYS`
- `STATIC_FORM_ALLOWED_ORIGINS`
- Any unrelated appsetting

No appsettings list/show command was run.
