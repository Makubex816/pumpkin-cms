# Missing Operator Inputs

Remaining exact inputs:

1. Future approval for backend verification, including whether no-email dry-run staging verification is sufficient or whether real email delivery must be verified.
2. If real backend verification is required, explicit approval for live HTTP/form test scope, endpoint mode, approved payload, recipient/workflow confirmation, and abort rules.
3. Confirmed approved subscription or redacted subscription reference for the Ice Static Web Apps staging target.
4. Confirmation that `swa-ice-rink-rentals-staging` exists, or explicit approval for a future Azure resource-creation boundary.
5. Azure default hostname, or exact approved staging host plus DNS plan if DNS is later approved.
6. Deployment method/profile for staging that does not require committed secrets.
7. Named future deploy operator and rollback/abort owner.

Still closed unless separately approved:

- DNS mutation,
- Search Console/indexing,
- live publication,
- live contact form submission outside the future backend verification scope,
- external crawling/live HTTP checks outside the future verification scope.

