# Static Form Local Gate Result

Result: passed.

| Check | Result |
| --- | --- |
| Static output validator static form gate | `configured_owner_approved_backend_verified` |
| Staging package validator static form gate | `configured_owner_approved_backend_verified` |
| Command | `npm --prefix deployment/static-azure/forms/static-form-endpoint run check` |
| Local test command | `npm --prefix deployment/static-azure/forms/static-form-endpoint run test` |
| Local test checks | `29` checks passed |
| Live form submission | `0` |
| Contact endpoint POST | `0` |
| Graph/live delivery | mocked/local only |

The static form result confirms local handler and validator health. It does not approve a production live form submission.

