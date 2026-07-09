# Security Boundary Result

Status: passed.

Allowed live mutation:

- One starter preview App Service redeploy to `app-pumpkin-starter-preview-centralus-001`.

Confirmed not performed:

- Pumpkin API deploy.
- Admin UI deploy.
- Airstrip probe, deploy, content/media mutation, DomainBinding mutation, DNS action, or package-output mutation.
- Ice mutation.
- Party Pros publish or CMS mutation.
- Contact POST.
- Form submission.
- Customer-facing POST proof.
- DNS/custom-domain action.
- Nameserver change.
- Appsetting mutation.
- New Azure App Service, Static Web App, Cosmos account, or Storage account.
- Storage keys/listKeys/SAS.
- Secret, token, cookie, or protected config value print.
- Git staging.
- All-path git add.

Name-only appsetting readback was allowed and completed without printing values.
