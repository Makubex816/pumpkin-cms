# HTTPS-Only Result

Status: enabled.

HTTPS-only was enabled only after:

- both custom hostnames had `SniEnabled` SSL bindings;
- the default starter host returned 200;
- custom HTTPS route proof returned 200 after bounded recheck.

Final App Service readback:

- `httpsOnly=true`.

HTTP behavior after enabling HTTPS-only:

| URL | Result |
| --- | --- |
| `http://partyrentalphiladelphia.com/` | `301` to `https://partyrentalphiladelphia.com/` |
| `http://partyrentalphiladelphia.com/contact` | `301` to `https://partyrentalphiladelphia.com/contact` |
| `http://partyrentalphiladelphia.com/service-areas` | `301` to `https://partyrentalphiladelphia.com/service-areas` |
| `http://www.partyrentalphiladelphia.com/` | `301` to `https://www.partyrentalphiladelphia.com/` |
| `http://www.partyrentalphiladelphia.com/contact` | `301` to `https://www.partyrentalphiladelphia.com/contact` |
| `http://www.partyrentalphiladelphia.com/service-areas` | `301` to `https://www.partyrentalphiladelphia.com/service-areas` |
