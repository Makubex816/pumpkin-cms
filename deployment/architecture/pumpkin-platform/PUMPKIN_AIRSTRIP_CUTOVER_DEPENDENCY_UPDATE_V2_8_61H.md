# Pumpkin Airstrip Cutover Dependency Update V2.8.61H

Status: cutover paused by owner, runtime still healthy.

Airstrip production default host remains:

`https://app-airstrip-prod-centralus-001.azurewebsites.net`

Fresh GET-only checks returned HTTP 200 for:

- `/`
- `/request-booking`
- `/packages`
- `/airstrip-the-club`

External upstream integration is not technically required before Airstrip custom-domain cutover. It is a product/engineering sequencing decision. If the owner wants fastest domain completion, resume cutover on the current proven runtime with a separate approval. If the owner wants the upstream API/forms/starter work integrated first, keep cutover paused and start a separate integration lane.

No DNS, custom-domain, indexing, deploy, appsetting, form submission, or contact POST occurred in V2.8.61H.
