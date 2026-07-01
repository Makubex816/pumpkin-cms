# Pumpkin External Integration Build Map V2.8.53R

## Build Priority

Secondary tenant creation remains paused until external compatibility remediation is approved and proven.

## Required Sequence

1. Preserve the V2.8.53R external commit lock as the compatibility reference.
2. Add current-build route aliases for external routes missing from current source:
   - `POST /api/forms/{tenantId}/submit/{type}`
   - `GET /api/admin/forms/{tenantId}/entries`
   - `GET /api/admin/forms/{tenantId}/entries/{entryId}`
   - `PUT /api/admin/forms/{tenantId}/entries/{entryId}/status`
3. Verify legacy external contact payload expectations against current FormEntry/FormDefinition models.
4. Reconcile ProviderMetadataService source container names with future-target provider metadata naming.
5. Convert Ice/Roller hard-coded static/publish/provider assumptions into package-driven tenant profiles.
6. Run source tests and GET-only no-regression.
7. Only then resume V2.8.53 controlled secondary tenant creation preflight.

## Not Allowed Without New Approval

- External repo mutation.
- External DB mutation or replacement.
- Tenant creation.
- Deploy.
- Appsetting or Azure mutation.
- Contact POST or form submission.
- DNS/indexing.

## Next Gate

V2.8.53S should be an implementation preflight for external compatibility adapters and hard-coded tenant profile remediation, not tenant creation.
