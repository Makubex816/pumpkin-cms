# Static Form Local Gate Result

Result: passed.

| Check | Result |
| --- | --- |
| Static source validation | `npm run validate:static:ice`, passed with 34 existing warnings |
| Ice app type-check | `npm run type-check`, passed |
| Static form syntax command | `npm --prefix deployment/static-azure/forms/static-form-endpoint run check`, passed |
| Static form local test command | `npm --prefix deployment/static-azure/forms/static-form-endpoint run test`, passed |
| Local test checks | `29` checks passed |
| Live form submission in local tests | `0` |
| Contact endpoint POST in local tests | `0` |
| Graph/live delivery in local tests | mocked/local only |

The static form local gate passed before the single approved live POST was sent.

