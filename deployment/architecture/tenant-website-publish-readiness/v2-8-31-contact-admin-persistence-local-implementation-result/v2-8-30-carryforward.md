# V2.8.30 Carryforward

V2.8.30 selected `admin-persistence-required`.

Carryforward decision:

- Accepted contact submissions must create Pumpkin `FormEntry` records in the same backend/store Admin reads.
- Email-only delivery does not close this gate.
- Dual delivery is future optional only after Admin persistence is proven.
- The next implementation should keep `/api/static-contact` and bind `pumpkin-api` mode to Pumpkin API `POST /api/forms/ice-rink-rentals/entries`.
- The write path exists and requires a protected server-side Ice tenant API key.

