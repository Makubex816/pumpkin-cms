# Provider Appsetting Mutation Result

Mutation status: succeeded.

Subscription lock:

- Expected subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`.
- Active subscription ID matched: yes.
- Active subscription name: `Azure subscription 1`.
- Operator user: `Contact@iceskatingrinkrentals.com`.

Target:

- Resource group: `rg-pumpkin-api-prod-centralus`.
- Web App: `app-pumpkin-api-prod-centralus-001`.

Command shape:

- Used `az webapp config appsettings set ... -o none`.
- Did not run appsettings list/show.

Appsettings set:

- `Database__Provider`
- `Database__CosmosDb__ConnectionString`
- `Database__CosmosDb__DatabaseName`
- `Jwt__SecretKey`

Not set:

- No FormEntry container appsetting was set because source does not expose one.
- No unrelated provider/contact/database secret was mutated.
- No JWT issuer/audience/expiration setting was mutated.

Restart:

- Web App restart was run after the appsetting mutation.

Secret handling:

- Provider connection string value was not printed or written.
- Admin JWT secret value was not printed or written.

