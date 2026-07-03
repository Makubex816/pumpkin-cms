# Tenant API Key Binding Result

Result:

- Tenant API key value from the approved secure file was hashed and bound to the Airstrip tenant.
- Tenant API key value was never printed or written.
- Tenant API key hash was not written to repo reports.
- Public source-supported proof path: GET /api/forms/{tenantId}/definitions/airstrip-reservation.
- Public proof HTTP status using the tenant key in-memory: 200.
- Returned FormDefinition key: $(@{phase=v2-8-58b; tenantId=airstrip-club-las-vegas; startedAt=2026-07-03T01:50:37.3359108Z; package=; writes=; readback=; isolation=; iceNoChange=; publicTenantApiKeyProof=; security=; completedAt=2026-07-03T01:50:51.0057072Z}.publicTenantApiKeyProof.formKey).
- Static endpoint reference: $(@{phase=v2-8-58b; tenantId=airstrip-club-las-vegas; startedAt=2026-07-03T01:50:37.3359108Z; package=; writes=; readback=; isolation=; iceNoChange=; publicTenantApiKeyProof=; security=; completedAt=2026-07-03T01:50:51.0057072Z}.publicTenantApiKeyProof.staticEndpointRef).
- Lead recipient reference: $(@{phase=v2-8-58b; tenantId=airstrip-club-las-vegas; startedAt=2026-07-03T01:50:37.3359108Z; package=; writes=; readback=; isolation=; iceNoChange=; publicTenantApiKeyProof=; security=; completedAt=2026-07-03T01:50:51.0057072Z}.publicTenantApiKeyProof.leadRecipientRef).

Static-contact secret handling:

- The secure airstripStaticContactApiKey value was not printed or written.
- Source models support non-secret static endpoint and lead recipient references for CMS records.
- No source-supported CMS field was found for storing the static-contact secret value during this no-deploy/no-appsetting phase.
- Future Airstrip static-site/appsetting binding remains a separate approval.
