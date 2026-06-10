# Test Fixture Plan

Future implementation should keep local/fake fixtures as the first test layer.

## Fixture Sets

- single active link
- same URL on multiple pages
- duplicate URL in multiple fields
- disabled global link
- disabled specific instance
- domain-blocked link
- pending-review domain
- stale instance after rescan
- policy default behavior
- tenant-bundle export
- onboarding import valid
- onboarding import with blocked domain
- backup export candidate
- restore validation candidate

## Test Layers

| Layer | Focus |
| --- | --- |
| Unit | URL normalization, domain normalization, policy resolution, status lifecycle |
| Provider | local JSON provider, in-memory provider, future Cosmos provider contracts |
| Service | tenant scoping, permissions, mode gates, audit requirements |
| API contract | filters, pagination, status codes, errors, ETags |
| Admin UI | read-only views, disabled actions, filter state, route behavior |
| Integration | Backup Center, onboarding import, tenant bundle, render decision compatibility |
| Security | tenant leakage, mixed-tenant bulk actions, unsafe logs, write gate denial |

No external crawling or live HTTP checks are required for these tests.

