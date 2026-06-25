# Risk and Open Decisions

Risks:

- Upload execution remains blocked; no media will be available at the planned public URLs until a later approved upload/readback phase.
- Contact replacement assets are staged but not owner-approved, so contact-page media remains visually unresolved.
- Azure target execution details are incomplete.
- Generic source fallback email values could display `hello@{{domain}}` if fallback content is used without tenant-specific override.
- Production-bound deployment remains dangerous because real custom domains are attached to `swa-ice-static-staging`.

Open decisions:

- Whether to approve Azure media upload execution in a later phase.
- Whether to approve or reject the 3 contact replacement candidates.
- Exact Azure storage/provider target.
- Exact authentication/session method.
- Readback method.
- Cache-control policy.
- Overwrite policy.
- Later source integration timing after upload/readback.
- Later isolated staging preview timing after source integration.
