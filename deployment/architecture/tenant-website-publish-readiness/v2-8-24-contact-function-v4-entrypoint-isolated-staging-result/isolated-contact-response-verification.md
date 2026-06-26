# Isolated Contact Response Verification

POST response:

- Status: 404
- Body empty: true
- Raw body length: 0
- Success flag returned: null
- Entry ID returned: null
- Public-safe top-level response keys: none, because the body was empty

Conclusion:

The v4 CommonJS entrypoint deployment did not make POST `/api/static-contact` discoverable on isolated staging. The behavior remains equivalent to the V2.8.23 failure after deployment, despite the different entrypoint shape.
