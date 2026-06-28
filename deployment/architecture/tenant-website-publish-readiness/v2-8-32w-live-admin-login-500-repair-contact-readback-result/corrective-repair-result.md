# Corrective Repair Result

Repair type:

Source-discovered non-provider JWT support setting repair.

Settings set on the existing Pumpkin API Web App:

- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpirationMinutes`

Mutation result:

- `az webapp config appsettings set`: exit code 0.
- `az webapp restart`: exit code 0.
- Web App restarted once.

Settings not changed:

- Provider connection string.
- Cosmos database name.
- Forms container name.
- Admin password.
- JWT secret value.

No appsettings list/show command was run.
