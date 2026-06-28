# Static Contact Preflight Result

Status: not run.

Reason:

Authenticated Admin FormEntry readback preflight did not run because no bearer token was issued. V2.8.32V requires authenticated Admin readback before static contact preflight and production POST.

No checks were run against:

- `https://iceskatingrinkrentals.com/api/static-contact-health`
- `https://iceskatingrinkrentals.com/contact`

