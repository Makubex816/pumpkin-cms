# Admin Auth Appsetting Mutation Result

Mutation result: not attempted.

Source-discovered setting that would be eligible for this phase:

- `Jwt__SecretKey`

Reason mutation did not run:

The approved secure file did not contain a value for `adminJwtSecretValue`.

Azure commands:

- `az account set`: not run.
- `az account show`: not run.
- `az webapp config appsettings set`: not run.
- `az webapp restart`: not run.

No app settings were listed or shown.

No provider, contact, or database secret app settings were mutated.

Exact blocker: `secure_file_missing_required_admin_jwt_secret_value`.

