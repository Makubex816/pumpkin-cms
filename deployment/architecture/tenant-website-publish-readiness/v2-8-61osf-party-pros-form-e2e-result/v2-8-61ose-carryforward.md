# V2.8.61OSE Carryforward

OSE is committed at `b4fab935` with message `Activate Party Pros submit key route after API deploy substrate cleanup`.

Carryforward accepted by OSF:

- Pumpkin API deployment substrate cleanup completed in the prior phase.
- Submit-key route activation completed in the prior phase.
- No normal OSD deploy was attempted in OSF.
- OSF used the already-live route and did not deploy Pumpkin API code.

OSF route readiness probe confirmed the route was live before provisioning: unauthenticated/no-secret POST to the submit-key route returned `401`, not `404`.

