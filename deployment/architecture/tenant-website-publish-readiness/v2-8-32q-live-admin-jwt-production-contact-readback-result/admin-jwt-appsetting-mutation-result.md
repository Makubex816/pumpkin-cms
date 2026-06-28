# Admin JWT Appsetting Mutation Result

Mutation result: completed for the single approved setting.

Subscription lock:

- `az account set` run: yes.
- `az account show` run: yes.
- Active subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`.
- Subscription matched approval: yes.

Allowed setting:

- `Jwt__SecretKey`

Mutation:

- App setting set run: yes.
- App setting set succeeded: yes.
- Mutated settings: `Jwt__SecretKey` only.
- Web App restart run: yes.
- Web App restart succeeded: yes.

Not performed:

- No appsettings list/show.
- No provider/contact/database secret setting mutation.
- No Azure resource creation/deletion.
- No deployment.

