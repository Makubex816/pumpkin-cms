# API-Side Key Setup Result

Result: blocked; no API-side key setup performed.

Source discovery:

- Pumpkin API validates submit keys by comparing the Bearer key to the tenant `apiKeyHash` with bcrypt verification.
- A SuperAdmin tenant update endpoint exists and stores tenant API key fields supplied in the tenant payload.
- A SuperAdmin regenerate endpoint exists, but it generates a new random key and is not a matching setup for the corrected handoff key.

Live auth checks:

- Corrected submit key against public Party Pros FormDefinition readback: `401`.
- Corrected custom-header Admin/readback auth against Admin endpoints: `401`.
- Visible `PUMPKIN_ADMIN_JWT` against Admin tenants endpoint: `401`.

Conclusion:

No authenticated source-supported path was available to set the handoff key as the Party Pros accepted API key. OSC stopped before any API-side mutation.
