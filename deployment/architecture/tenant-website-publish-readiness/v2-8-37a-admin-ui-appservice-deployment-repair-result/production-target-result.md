# Production Target Result

Production Admin Web App:

`app-pumpkin-admin-prod-centralus-001`

Initial state:

- The Web App did not exist at the start of V2.8.37A.

Action:

- Created the production Admin Web App on the approved existing App Service plan `asp-pumpkin-api-prod-centralus-001`.
- Runtime kind after creation: `app,linux`.
- State after creation: `Running`.
- Default host: `app-pumpkin-admin-prod-centralus-001.azurewebsites.net`.

Only non-secret Admin UI runtime settings were applied. No custom-domain or DNS mutation was performed.
