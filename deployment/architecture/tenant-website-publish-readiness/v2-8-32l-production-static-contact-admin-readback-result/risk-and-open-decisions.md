# Risk And Open Decisions

## Risks

- The production contact endpoint may be correctly bound, but Admin persistence is still unproven because the route cannot be read without an approved auth path.
- The next phase must preserve the one-POST rule. If a POST is sent and readback fails, it must not retry the POST.
- Admin readback responses may contain contact data. Future evidence must keep summaries public-safe and avoid dumping response bodies.

## Open Decisions

- Which Admin readback auth mode should be approved for the bounded production readback gate?
- Which header name should be used if the route expects a header-based auth value?
- Should the next phase use a route-level token, an existing Admin bearer token, or another approved read-only auth mechanism?

## Decision Needed

Approve the exact Admin FormEntry readback auth mode, header name, and protected auth value delivery method for the next bounded readback attempt.
