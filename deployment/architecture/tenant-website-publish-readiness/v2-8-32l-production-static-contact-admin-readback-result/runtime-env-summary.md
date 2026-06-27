# Runtime Env Summary

Runtime environment values were checked from the active shell environment. Protected auth values were not printed.

Expected runtime URLs:

- `PUMPKIN_API_BASE_URL`: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net`
- `PUMPKIN_PUBLIC_SITE_BASE_URL`: `https://iceskatingrinkrentals.com`
- `PUMPKIN_PUBLIC_WWW_SITE_BASE_URL`: `https://www.iceskatingrinkrentals.com`
- `PUMPKIN_CONTACT_PRODUCTION_HEALTH_URL`: `https://iceskatingrinkrentals.com/api/static-contact-health`
- `PUMPKIN_CONTACT_PRODUCTION_POST_URL`: `https://iceskatingrinkrentals.com/api/static-contact`
- `PUMPKIN_CONTACT_PRODUCTION_PAGE_URL`: `https://iceskatingrinkrentals.com/contact`
- `PUMPKIN_ADMIN_FORMENTRY_READ_URL`: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries`
- `PUMPKIN_CONTACT_FORMENTRY_WRITE_ROUTE`: `/api/forms/ice-rink-rentals/entries`

Expected tenant and form:

- `PUMPKIN_CONTACT_EXPECTED_TENANT_ID`: `ice-rink-rentals`
- `PUMPKIN_CONTACT_EXPECTED_FORM_ID`: `default-quote-request`
- `PUMPKIN_CONTACT_EXPECTED_PUBLIC_EMAIL`: `contact@iceskatingrinkrentals.com`

Synthetic payload env:

- `PUMPKIN_CONTACT_TEST_TRACE_ID`: `v2-8-32l-production-contact-admin-persistence-20260627190839`
- `PUMPKIN_CONTACT_TEST_NAME`: synthetic QA value present.
- `PUMPKIN_CONTACT_TEST_EMAIL`: synthetic QA email present; domain `iceskatingrinkrentals.com`; full value not printed.
- `PUMPKIN_CONTACT_TEST_PHONE`: synthetic QA phone present; length `8`; full value not printed.
- `PUMPKIN_CONTACT_TEST_EVENT_LOCATION`: synthetic QA value present.
- `PUMPKIN_CONTACT_TEST_MESSAGE`: synthetic QA value present and includes the trace ID.

Approval flags:

- `PUMPKIN_CONTACT_APPROVED_POST_COUNT`: `1`
- `PUMPKIN_CONTACT_DEPLOY_APPROVED`: `false`
- `PUMPKIN_CONTACT_APPSETTING_MUTATION_APPROVED`: `false`
- `PUMPKIN_CONTACT_DNS_APPROVED`: `false`
- `PUMPKIN_CONTACT_INDEXING_APPROVED`: `false`
- `PUMPKIN_CONTACT_PROTECTED_CONFIG_READ_APPROVED`: `false`

Admin readback auth env:

- `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE`: `none`
- `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`: `none`
- `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`: missing.

Runtime env verdict:

The URL, tenant, form, trace, synthetic payload, and approval env values were present. The Admin readback auth env was not available. Because the Admin route returned HTTP `401`, this became the hard blocker before POST.
