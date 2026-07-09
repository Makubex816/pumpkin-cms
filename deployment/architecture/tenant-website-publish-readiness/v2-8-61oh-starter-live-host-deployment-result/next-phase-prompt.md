# Next Phase Prompt

Approve V2.8.61OI Party Pros Starter Preview Binding Proof.

Scope:

- Use the shared starter preview host at `https://app-pumpkin-starter-preview-centralus-001.azurewebsites.net`.
- Keep the host shared, not Party Pros-only.
- Choose and approve a secure read-only Party Pros preview binding path.
- If tenant-specific appsettings are required, approve only server-side settings and do not print values.
- Prove Party Pros preview routes through default host only.
- Keep starter `/admin` tenant-local and standalone Admin UI as platform control plane.
- Run non-Airstrip GET-only runtime no-regression.
- Produce repo-safe docs.

Still not approved:

- No DNS/custom-domain action.
- No Party Pros page publish.
- No Party Pros content/media/user/form mutation.
- No contact POST.
- No form submission.
- No customer-facing POST proof.
- No Airstrip action.
- No Pumpkin API deploy.
- No standalone Admin UI deploy.
- No Ice deploy/action.
- No storage keys/listKeys/SAS.
- No new App Service plan or tenant-specific App Service.
- No new Cosmos/Storage/SWA/Key Vault/database.
- No indexing/Search Console.
- No `.tmp`, deployment ZIP, node_modules, backup bundle, hardcopy, tenant package, visual artifact, or external-reference staging.
- No `git add -A`.
