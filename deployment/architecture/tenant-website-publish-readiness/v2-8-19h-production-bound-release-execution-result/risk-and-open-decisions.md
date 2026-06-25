# Risk and Open Decisions

## Residual Risks

- Contact form backend delivery was not tested because contact POST was not approved.
- Public email/mailto is live, but mailbox delivery and backend routing remain outside this phase.
- The broader legacy static-output validator still contains older assumptions about media origin and static form endpoint readiness; V2.8.19H used the approved Azure Blob media and public-email-only gates.

## Decisions Made

- A tiny source validation fix changed recovered page robots metadata to `index, follow` after owner production approval.
- Production deployment proceeded only after token confirmation and target classification passed.
- The isolated staging target was not deployed.

## Next Decisions

- Owner business/content verification on production domains.
- Whether to approve any contact-form live submission test in a separate explicit phase.
- Whether to approve Search Console/indexing actions in a later explicit phase.

