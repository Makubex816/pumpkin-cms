# Isolated Preview Route Proof

Result: passed.

Host:

`https://app-airstrip-preview-isolated-centralus-001.azurewebsites.net`

HTTP route proof:

| Route | Status | Airstrip Text | Ice Text |
| --- | --- | --- | --- |
| `/` | HTTP 200 | true | false |
| `/request-booking` | HTTP 200 | true | false |
| `/packages` | HTTP 200 | true | false |
| `/airstrip-the-club` | HTTP 200 | true | false |

Browser diagnostics:

- Console errors: 0.
- Failed requests: 0.
- HTTP 4xx/5xx browser responses: 0.
- Missing asset errors: 0.
- Image count: 12.
- Airstrip text present: true.
- Ice text present: false.

The isolated preview static package routes use packaged Airstrip assets. CMS public page API proof separately verified Airstrip Blob media references in the Airstrip CMS page JSON.
