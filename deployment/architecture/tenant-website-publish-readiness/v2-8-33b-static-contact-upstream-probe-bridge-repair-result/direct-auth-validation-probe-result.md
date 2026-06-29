# Direct Auth Validation Probe Result

Probe type:

Direct non-persisting Pumpkin API write-route probe with intentionally invalid payload.

Result:

- Probe sent: yes.
- HTTP status: 400.
- Safe response summary: validation errors were returned.
- Route reached: yes.
- Entry created: no.
- Secret values printed: no.

Interpretation:

The route and validation path were reachable. Source inspection showed malformed payload validation runs before tenant-key verification, so this 400 did not prove the tenant key was accepted.
