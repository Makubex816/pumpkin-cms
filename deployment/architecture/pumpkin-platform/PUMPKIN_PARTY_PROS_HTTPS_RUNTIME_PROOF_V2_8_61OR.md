# Party Pros HTTPS Runtime Proof V2.8.61OR

Status: passed.

Final HTTPS proof:

- `https://partyrentalphiladelphia.com/`: 200.
- `https://partyrentalphiladelphia.com/contact`: 200.
- `https://partyrentalphiladelphia.com/service-areas`: 200.
- `https://www.partyrentalphiladelphia.com/`: 200.
- `https://www.partyrentalphiladelphia.com/contact`: 200.
- `https://www.partyrentalphiladelphia.com/service-areas`: 200.

HTTP behavior:

- All six HTTP custom-domain routes return `301` to the corresponding HTTPS URL.

Default and preview proof:

- Default starter home returned 200.
- Starter `/admin/login` returned 200.
- Starter `/admin` returned 307 to login.
- Party Pros preview routes returned 200.
