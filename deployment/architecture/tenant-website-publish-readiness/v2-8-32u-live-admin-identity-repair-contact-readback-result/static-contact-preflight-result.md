# Static Contact Preflight Result

Status: not run.

Reason:

The authenticated Admin FormEntry readback preflight did not pass because no bearer token was issued. V2.8.32U requires authenticated Admin readback before static contact preflight and production POST.

No checks were run against:

- `https://iceskatingrinkrentals.com/api/static-contact-health`
- `https://iceskatingrinkrentals.com/contact`

