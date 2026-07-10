# Tenant Isolation Proof

Party Pros positive readback:

- Tenant: `party-pros-philadelphia`
- Entry id: `43dcad71-0f9c-47b2-97db-69374ee9560f`
- Admin API status: `200`

Ice negative readback:

- Tenant checked: `ice-rink-rentals`
- Same entry id: `43dcad71-0f9c-47b2-97db-69374ee9560f`
- Admin API status: `404`
- Classification: no same-id leakage into the Ice FormEntry partition.

Airstrip:

- No Airstrip probe or action was performed because OSF explicitly prohibited Airstrip action.

