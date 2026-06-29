# Upstream Auth Negative Probe Result

Probe status: not run.

Reason:

Source did not prove a direct Pumpkin API probe using the real static contact key could be guaranteed non-persisting.

Relevant source facts:

- Pumpkin API validates and sanitizes form submissions before database persistence.
- Invalid payload probes can fail before tenant API-key validation, so they do not prove whether the static key is accepted.
- A valid payload with a valid key could persist a FormEntry.

Because V2.8.32Z had a hard stop against extra Cosmos mutations outside the single approved corrected production POST, no direct upstream probe using the real static key was run.
