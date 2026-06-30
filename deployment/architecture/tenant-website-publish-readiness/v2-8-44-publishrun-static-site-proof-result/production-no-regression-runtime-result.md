# Production No Regression Runtime Result

Production route checks:
- apex /: HTTP 200, ok=true
- apex /contact: HTTP 200, ok=true
- apex /service-areas: HTTP 200, ok=true
- apex /api/static-contact-health: HTTP 200, ok=true
- www /: HTTP 200, ok=true

Proof residual check:

- Proof status: HTTP 404.
- Proof trace present: false.
- Proof absent: true.
