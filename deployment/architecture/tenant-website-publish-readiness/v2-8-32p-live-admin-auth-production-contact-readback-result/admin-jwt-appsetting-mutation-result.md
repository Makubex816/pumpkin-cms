# Admin JWT Appsetting Mutation Result

Mutation result: not attempted.

Allowed app setting for this phase:

- `Jwt__SecretKey`

Reason mutation did not run:

The saved JWT path failed with HTTP `401`, and the fallback binding file did not include `adminJwtSecretValue`.

Azure commands:

- `az account set`: not run.
- `az account show`: not run.
- `az webapp config appsettings set --settings Jwt__SecretKey=<value> -o none`: not run.
- `az webapp restart`: not run.

Settings mutated: none.

No provider/contact/database secret settings were mutated.

No app settings were listed or shown.

