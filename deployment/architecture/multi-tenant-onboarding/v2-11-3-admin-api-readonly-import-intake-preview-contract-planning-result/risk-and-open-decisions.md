# Risk And Open Decisions

Risks:

- Future implementation must avoid turning read-only preview readiness into import execution authority.
- Contract fixture parity must stay synchronized with builder preview output.
- Admin/API implementation must not accidentally introduce mutation routes.
- Package registry source is not yet defined.

Open decisions:

- Whether V2.11.4 stores fixture envelopes beside Admin code or imports them from the governance package.
- Whether package comparison should allow more than two candidates.
- Whether future API routes should expose refs as one combined endpoint or separate media/form/provider/evidence endpoints.
