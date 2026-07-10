# V2.8.61OSRA Carryforward

OSRA is committed at `fd13e767`.

Accepted carryforward:

- OSRA blocked before live action because required secure values were missing.
- No appsettings, deploy, key regeneration, submit, FormEntry creation/readback, Admin proof, Airstrip, DNS/TLS, or customer POST occurred.

OSC used the corrected secure handoff. The previously missing required secure fields are now non-empty, but the handoff submit key is not accepted by the live Pumpkin API and the Admin/readback auth is not accepted by the live Admin API.
