# Future API And Electron Boundary Summary

Status: boundaries preserved.

V2.9.7 did not implement:

- live API endpoints;
- Pumpkin API runtime endpoints;
- API controllers;
- Electron runtime;
- runtime job integration.

Future API work should be a separate GET-only Pumpkin API read-only endpoint preflight and implementation-gate phase. It should reuse the V2.9.6 read-only API envelope contract, require Admin authorization and tenant/site context, reject write methods, and preserve no-write/security/redaction checks.

Future Electron work remains separately gated after API/runtime contract behavior is proven.

