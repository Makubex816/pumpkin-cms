# Future Custom-Domain Binding Readiness

## Ready Pieces

Azure DNS now has:

- `@` A to the App Service external IP;
- `www` CNAME to the starter default host;
- `asuid` TXT;
- `asuid.www` TXT.

## Held Pieces

Still held:

- registrar nameserver change;
- email DNS migration or no-email owner decision;
- Azure App Service custom hostname binding;
- managed TLS;
- Party Pros publish;
- contact/form POST proof.

## Future Binding Phase

A future phase must:

- verify public DNS after nameserver delegation;
- add App Service hostname bindings only after approval;
- create managed TLS only after approval;
- run runtime no-regression after binding;
- keep form/customer-facing POST proof separately approved.
