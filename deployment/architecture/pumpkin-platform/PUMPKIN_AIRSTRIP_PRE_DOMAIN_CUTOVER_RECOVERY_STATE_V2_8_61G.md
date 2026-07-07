# Pumpkin Airstrip Pre-Domain Cutover Recovery State V2.8.61G

Status: pre_domain_ready_for_dns_verification_only

Airstrip default host:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Observed Azure resource:

- App Service: `app-airstrip-prod-centralus-001`
- Resource group: `rg-pumpkin-api-prod-centralus`
- State: Running

Current API readback:

- Tenant exists: `airstrip-club-las-vegas`.
- Media assets: 13.
- Pages: 5.
- Theme records: 1.
- Form definitions: 1.
- DomainBinding records: 1.

DomainBinding state:

- Status: `pending_dns_records`.
- DNS validation: `pending`.
- Azure hostname: `not_started`.
- TLS: `not_started`.
- Runtime: `not_started`.
- Promotion: `not_promoted`.

Custom-domain cutover remains blocked until owner DNS is applied and a separate Azure binding/TLS approval is active.
