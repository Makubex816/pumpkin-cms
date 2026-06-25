# Risk and Open Decisions

## Risks

Live contact delivery not verified:

- The single approved POST returned HTTP 405.
- No success response, entry ID, or confirmation message was returned.
- Backend delivery is pending operator confirmation.

Static/runtime endpoint mismatch risk:

- Public code supports `/api/contact` for runtime submission.
- Public code also supports static endpoint overrides.
- The live page did not expose a static form action.
- The public `/api/contact` endpoint did not accept POST on the live deployment.

Customer lead capture risk:

- If normal visitors use the current form path and the live endpoint behaves the same way, quote requests may fail to submit.
- The public `mailto:` fallback remains visible, but form delivery itself is not verified.

## Open Decisions

Operator confirmation:

- Does trace ID `v2-8-20-live-contact-20260625140126` appear in the intended backend or inbox?

Remediation lane:

- Should the next phase inspect and repair the static contact endpoint configuration, the SWA Functions/API deployment boundary, or both?

Retest approval:

- A second live contact POST is not approved in V2.8.20.
- Any future retest must receive separate explicit approval and should occur only after remediation or operator evidence clarifies the delivery path.
