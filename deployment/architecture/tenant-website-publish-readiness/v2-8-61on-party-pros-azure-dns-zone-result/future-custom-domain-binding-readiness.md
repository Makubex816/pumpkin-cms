# Future Custom-Domain Binding Readiness

## ON Result

Azure DNS zone and verification records are ready for a future App Service custom-domain binding phase.

ON did not bind a custom hostname.

ON did not create managed TLS.

## Prerequisites For Future Binding

A future phase must:

- confirm owner/client nameserver delegation to Azure has propagated, or confirm registrar-managed records validate;
- resolve the apex A pending state;
- confirm `asuid` and `asuid.www` TXT records validate through public DNS;
- confirm `www` CNAME validates through public DNS;
- approve Azure App Service hostname binding;
- approve managed TLS separately;
- run runtime no-regression after binding.

## Held Actions

The following remain held:

- Azure App Service custom hostname binding;
- managed TLS;
- Party Pros page publish;
- production custom-domain launch;
- contact/form POST proof;
- authenticated form E2E proof.
