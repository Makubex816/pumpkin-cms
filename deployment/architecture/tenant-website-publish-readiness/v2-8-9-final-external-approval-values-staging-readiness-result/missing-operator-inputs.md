# Missing Operator Inputs

The exact missing inputs are:

1. Explicit owner approval for using `https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact` as the Ice static contact form endpoint.
2. Explicit backend verification evidence that the approved endpoint accepts the Ice static form payload and routes leads to the approved owner workflow.
3. Explicit owner approval for the final `/contact` contact-form behavior and copy.
4. Explicit owner approval for final media/content on `/`, `/service-areas`, and `/contact`.
5. Exact staging deployment target approval, including target Static Web App/resource identity, resource group, host/default hostname, upload/deployment mechanism, operator, rollback/abort criteria, and approval to cross into a future staging publish execution phase.

Still closed and not requested in V2.8.9:

- DNS change approval,
- Search Console/indexing approval,
- live publication approval,
- live contact form submission approval,
- external crawling/live HTTP check approval.

