# Party Pros Custom Domain Binding V2.8.61OQ

Status: custom hostnames bound; managed TLS not bound.

Bound App Service:

- Resource group: `rg-pumpkin-api-prod-centralus`.
- App Service: `app-pumpkin-starter-preview-centralus-001`.

Bound hostnames:

- `partyrentalphiladelphia.com`
- `www.partyrentalphiladelphia.com`

Runtime result:

- HTTP custom-domain routes `/`, `/contact`, and `/service-areas` returned 200 for apex and `www`.
- Responses contained Party Pros markers and host tenant marker `party-pros-philadelphia`.
- HTTPS custom-domain runtime proof is held until managed TLS binds.

Boundaries:

- No registrar login or registrar DNS mutation occurred.
- No nameserver mutation occurred.
- No Party Pros CMS mutation or publish occurred.
- No contact POST or form submission occurred.
