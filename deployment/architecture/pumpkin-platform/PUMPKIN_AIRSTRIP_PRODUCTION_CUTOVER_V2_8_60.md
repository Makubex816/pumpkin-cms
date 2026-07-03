# Pumpkin Airstrip Production Cutover V2.8.60

Status: `production_default_host_live_bluehost_dns_owner_action_required`.

Production App Service:

- `app-airstrip-prod-centralus-001`
- `https://app-airstrip-prod-centralus-001.azurewebsites.net`

Outcome:

- Production App Service created on the approved existing Linux App Service plan.
- Production Next standalone server deployed exactly once.
- Default-host route proof passed.
- Bluehost DNS packet was generated with exact App Service A/CNAME/TXT records.
- Custom domains were not bound because Bluehost DNS validation was not ready.
- Indexing remained excluded.

Custom-domain cutover remains a separate next approval after owner adds the Bluehost records and DNS propagates.
