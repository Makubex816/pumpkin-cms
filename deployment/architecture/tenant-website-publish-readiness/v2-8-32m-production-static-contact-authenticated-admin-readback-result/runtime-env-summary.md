# Runtime Env Summary

All values below are public-safe. The auth value was not printed or written.

| Env | Present | Public-safe value |
| --- | --- | --- |
| `PUMPKIN_API_BASE_URL` | yes | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net` |
| `PUMPKIN_PUBLIC_SITE_BASE_URL` | yes | `https://iceskatingrinkrentals.com` |
| `PUMPKIN_PUBLIC_WWW_SITE_BASE_URL` | yes | `https://www.iceskatingrinkrentals.com` |
| `PUMPKIN_CONTACT_PRODUCTION_HEALTH_URL` | yes | `https://iceskatingrinkrentals.com/api/static-contact-health` |
| `PUMPKIN_CONTACT_PRODUCTION_POST_URL` | yes | `https://iceskatingrinkrentals.com/api/static-contact` |
| `PUMPKIN_CONTACT_PRODUCTION_PAGE_URL` | yes | `https://iceskatingrinkrentals.com/contact` |
| `PUMPKIN_ADMIN_FORMENTRY_READ_URL` | yes | `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/admin/ice-rink-rentals/form-entries` |
| `PUMPKIN_CONTACT_FORMENTRY_WRITE_ROUTE` | yes | `/api/forms/ice-rink-rentals/entries` |
| `PUMPKIN_CONTACT_TEST_TRACE_ID` | yes | `v2-8-32m-production-contact-admin-persistence-20260627213404` |
| `PUMPKIN_CONTACT_TEST_NAME` | yes | synthetic QA name |
| `PUMPKIN_CONTACT_TEST_EMAIL` | yes | expected public contact email |
| `PUMPKIN_CONTACT_TEST_PHONE` | yes | synthetic `555` test number |
| `PUMPKIN_CONTACT_TEST_EVENT_LOCATION` | yes | synthetic QA location |
| `PUMPKIN_CONTACT_TEST_MESSAGE` | yes | synthetic message containing trace ID |
| `PUMPKIN_CONTACT_EXPECTED_TENANT_ID` | yes | `ice-rink-rentals` |
| `PUMPKIN_CONTACT_EXPECTED_FORM_ID` | yes | `default-quote-request` |
| `PUMPKIN_CONTACT_EXPECTED_PUBLIC_EMAIL` | yes | `contact@iceskatingrinkrentals.com` |
| `PUMPKIN_CONTACT_APPROVED_POST_COUNT` | yes | `1` |
| `PUMPKIN_CONTACT_DEPLOY_APPROVED` | yes | `false` |
| `PUMPKIN_CONTACT_APPSETTING_MUTATION_APPROVED` | yes | `false` |
| `PUMPKIN_CONTACT_DNS_APPROVED` | yes | `false` |
| `PUMPKIN_CONTACT_INDEXING_APPROVED` | yes | `false` |
| `PUMPKIN_CONTACT_PROTECTED_CONFIG_READ_APPROVED` | yes | `false` |
| `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE` | yes | `custom-header` |
| `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME` | no | missing |
| `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE` | no | redacted; not printed |

Runtime conclusion: required custom-header readback auth env is incomplete. Stop before POST.
