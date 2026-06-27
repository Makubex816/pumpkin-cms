# V2.8.32H Carryforward

V2.8.32H resolved the prior Azure deployment HTTP `400` by repacking the publish output with POSIX `/` ZIP entry paths.

H target:

- Resource group: `rg-pumpkin-api-prod-centralus`
- Plan: `asp-pumpkin-api-prod-centralus-001`
- Web App: `app-pumpkin-api-prod-centralus-001`
- Base URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`

H deployment:

- Deployment id: `09a22446-d448-4cea-b77f-fb7dc256af9b`
- Azure result: `RuntimeSuccessful`
- `/health`: HTTP `500`
- `/api/health`: HTTP `500`

H blocker carried forward to I:

`runtime_health_500_requires_separate_startup_secret_or_auth_configuration_diagnostics`
