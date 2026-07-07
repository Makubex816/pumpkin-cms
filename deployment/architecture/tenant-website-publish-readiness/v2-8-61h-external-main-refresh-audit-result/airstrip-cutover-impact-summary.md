# Airstrip Cutover Impact Summary

Status: paused by owner due external upstream refresh, not blocked by runtime.

Airstrip current state:

- Tenant: `airstrip-club-las-vegas`.
- Production default host: `https://app-airstrip-prod-centralus-001.azurewebsites.net`.
- Required default-host GET routes are HTTP 200.
- DomainBinding is pending DNS.
- Custom-domain cutover and indexing remain unapproved in V2.8.61H.

Impact from upstream main refresh:

- Upstream starter app does not need to be integrated for the existing Airstrip production default host.
- Upstream form submit work should not be pulled into Airstrip cutover because no customer-facing form POST is approved in this phase.
- Upstream embedded `/admin` should not be used for Airstrip production admin during cutover.
- Upstream API route changes should not be merged before cutover without a contract test phase.

Recommended owner decision:

Choose one path:

1. Resume Airstrip custom-domain cutover with the current proven runtime and no upstream integration.
2. Keep cutover paused and approve a separate upstream integration planning/implementation lane.

Do not combine cutover, upstream API/forms integration, and customer-facing form proof in one phase.
