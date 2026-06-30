# SWA Appsetting Redacted Comparison

The approved secure file supplied seven expected static-contact setting names. Values were read only in-memory and were never printed or written.

Initial comparison:

- The first parser treated Azure CLI output as flat and reported settings absent.
- A schema check showed `az staticwebapp appsettings list` returns the setting names under a nested `properties` object.

Repair comparison after setting the approved static-contact appsettings:

| Target | Expected settings present | Expected values exact match | Expected values non-empty | Outer whitespace |
| --- | --- | --- | --- | --- |
| Production SWA | yes | yes | yes | none found |
| Isolated SWA | yes | yes | yes | none found |

Expected setting names:

- `FORM_DELIVERY_MODE`
- `PUMPKIN_API_URL`
- `PUMPKIN_CONTACT_PROTECTED_KEY_ENV_NAME`
- `PUMPKIN_CONTACT_PUMPKIN_API_WRITE_ROUTE`
- `PUMPKIN_STATIC_CONTACT_PUMPKIN_API_KEY`
- `STATIC_FORM_ALLOWED_ORIGINS`
- `STATIC_FORM_ALLOWED_SITE_KEYS`

An additional existing setting name ending in `_HAS_WHITESPACE` was present in the nested settings object. Its value was not printed or written.

