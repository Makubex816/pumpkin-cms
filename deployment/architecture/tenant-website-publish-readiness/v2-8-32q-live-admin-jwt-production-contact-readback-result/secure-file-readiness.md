# Secure File Readiness

Approved secure file:

`.tmp/v2-8-32q/secure/live-admin-auth-binding.json`

Readiness result:

- File exists: yes.
- Git ignored: yes, matched `.gitignore:35:.tmp/`.
- JSON parsed: yes.
- Subscription ID matched approval: yes.
- Pumpkin API resource group matched approval: yes.
- Pumpkin API Web App matched approval: yes.
- Pumpkin API base URL matched approval: yes.
- Admin email present: yes.
- Admin password present: yes.
- Admin JWT app setting name: `Jwt__SecretKey`.
- Admin JWT config path: `Jwt:SecretKey`.
- Admin JWT secret value present: yes.
- Login payload shape: `email-password`.
- Admin readback auth shape: `Authorization: Bearer <token>`.
- Admin FormEntry read URL matched approval: yes.
- Contact POST URL matched approval: yes.

Secret handling:

- `adminPassword` was not printed or written.
- `adminJwtSecretValue` was not printed or written.
- The secure file was not copied into the result package.

