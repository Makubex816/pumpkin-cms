# Next Phase Prompt

Approve V2.8.17B Production Deployment Auth Replacement And Corrective Retry Approval only.

Use the completed V2.8.17A result package to verify that the operator has loaded a valid `SWA_CLI_DEPLOYMENT_TOKEN` for the existing production-domain Azure Static Web App `swa-ice-static-staging` in resource group `rg-ice-static-staging`. Use presence-only checks and non-deploying tooling validation first. Never print, echo, list, export, log, commit, write, or reveal the token value. Do not run `az staticwebapp secrets list`. Do not read `.env.local` or protected config to obtain credentials.

If and only if:

- the target remains exactly `swa-ice-static-staging` in `rg-ice-static-staging`;
- `iceskatingrinkrentals.com` and `www.iceskatingrinkrentals.com` remain attached and `Ready`;
- the token is present by boolean-only PowerShell and Node checks;
- non-deploying validation no longer rejects the deployment token;
- the sanitized Ice static artifact is rebuilt/revalidated;
- static output, staging package, artifact root, and artifact security gates pass;
- no DNS/custom-domain/indexing/contact-form/CMS/provider/Azure config/protected-config boundaries are crossed;

then execute exactly one corrective production static artifact deployment to `swa-ice-static-staging`.

After successful deployment only, run bounded GET checks for:

- `https://iceskatingrinkrentals.com/`
- `https://iceskatingrinkrentals.com/service-areas`
- `https://iceskatingrinkrentals.com/contact`
- `https://www.iceskatingrinkrentals.com/`
- `https://www.iceskatingrinkrentals.com/service-areas`
- `https://www.iceskatingrinkrentals.com/contact`

Do not crawl. Do not follow outbound links. Do not submit forms. Do not POST to the contact endpoint. Do not request indexing. Do not broadly retry after a sent deployment attempt.
