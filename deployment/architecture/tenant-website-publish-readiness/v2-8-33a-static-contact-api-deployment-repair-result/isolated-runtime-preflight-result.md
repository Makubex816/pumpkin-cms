# Isolated Runtime Preflight Result

Target host:

`https://kind-island-0a85a740f.7.azurestaticapps.net`

GET checks after isolated deploy:

- `/api/static-contact-health`: HTTP 200, `ok: true`.
- `/contact`: HTTP 200.
- `/contact` uses `/api/static-contact`: yes.
- `/contact` uses `/api/contact`: no.
- `/contact` contains `contact@iceskatingrinkrentals.com`: yes.

Admin preflight:

- Live Pumpkin API Admin login: HTTP 200.
- Bearer token printed: no.
- Authenticated Admin FormEntry readback: HTTP 200.
- Preflight readback count: 0.

Result: passed before the isolated POST.
