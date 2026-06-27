# Contact Gate Status

## Gate

Public Ice contact form submissions must persist as Pumpkin CMS `FormEntry` records and appear in Admin.

## Current status

OPEN.

## Current blocker

Live Pumpkin runtime wiring is incomplete. Current metadata does not show a live Pumpkin API Web App/App Service host. Without that host, public static contact cannot be safely bound to `POST /api/forms/ice-rink-rentals/entries`, and Admin cannot be proven to read the same persistence target.

## Gate can close only after

1. A live Pumpkin API runtime is verified.
2. The runtime is bound to the intended production Cosmos provider.
3. Admin is bound to the same API runtime.
4. Static contact is bound to Pumpkin API mode on an isolated lane.
5. A controlled write-read proof shows the same `FormEntry` id in Admin.
6. Production binding is separately approved and validated.

## No change to public status

V2.8.32A made no production contact changes and did not perform a new contact POST.
