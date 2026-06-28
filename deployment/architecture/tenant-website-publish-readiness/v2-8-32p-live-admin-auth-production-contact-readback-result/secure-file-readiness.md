# Secure File Readiness

Approved secure files checked:

- `.tmp/v2-8-32p/secure/saved-jwt-admin-readback-auth.json`
- `.tmp/v2-8-32p/secure/live-admin-auth-binding.json`

Readiness result:

| File | Exists | Git ignored | Parsed | Secret value disclosed |
| --- | --- | --- | --- | --- |
| Saved JWT auth | yes | yes, `.gitignore:35:.tmp/` | yes | no |
| Live Admin auth binding | yes | yes, `.gitignore:35:.tmp/` | yes | no |

Saved JWT file:

- Mode: `saved-jwt`.
- Header name: `Authorization`.
- Header value present: yes.
- Pumpkin API base URL matched approval: yes.
- Readback URL matched approval: yes.

Binding file:

- Subscription ID matched approval: yes.
- Resource group matched approval: yes.
- Web App matched approval: yes.
- Pumpkin API base URL matched approval: yes.
- Admin email present: yes.
- Admin password present: yes.
- App setting name: `Jwt__SecretKey`.
- App setting name matched approval: yes.
- Admin JWT secret value present: no.
- Admin FormEntry read URL matched approval: yes.
- Contact POST URL matched approval: yes.

At least one approved secure file existed. Both existed and were ignored.

