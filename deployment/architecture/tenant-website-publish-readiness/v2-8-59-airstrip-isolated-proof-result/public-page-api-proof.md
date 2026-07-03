# Public Page API Proof

Result: passed.

Public page API reads after repair:

| Slug | Status | Tenant | Published | Blob Media Prefix Present |
| --- | --- | --- | --- | --- |
| `home` | HTTP 200 | Airstrip | true | true |
| `contact` | HTTP 200 | Airstrip | true | true |
| `packages` | HTTP 200 | Airstrip | true | true |
| `request-booking` | HTTP 200 | Airstrip | true | true |
| `service-areas` | HTTP 200 | Airstrip | true | true |

Result:

- Expected page count: 5.
- HTTP 200 count: 5.
- All expected pages public-readable: yes.
- All returned pages are Airstrip tenant pages: yes.
- Airstrip Blob media prefix present in page JSON where applicable: yes.
