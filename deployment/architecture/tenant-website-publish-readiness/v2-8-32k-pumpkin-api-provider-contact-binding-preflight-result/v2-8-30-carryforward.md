# V2.8.30 Carryforward

V2.8.30 selected `admin-persistence-required`.

Carryforward facts:

- Accepted contact submissions must create Pumpkin `FormEntry` records in the backend read by Admin.
- Email-only delivery does not close this gate.
- Dual delivery remains future-optional after Admin persistence is proven.
- Static compat `pumpkin-api` mode is the approved low-risk path because it keeps `/api/static-contact` as the public endpoint and forwards accepted submissions to Pumpkin API.

This phase honored the carryforward by binding the Static Web App contact function to the Pumpkin API FormEntry write path without submitting a contact form.
