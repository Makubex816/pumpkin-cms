# Runtime Browser QA Requirements

Runtime browser QA is required before production writes.

Required Admin checks:

- Admin outbound link dashboard loads
- Action Center displays expected counts
- quick filters work
- list pagination works
- detail drawer opens
- policy explanation renders
- trace IDs display for local/fake action responses
- future write actions show preflight/approval state
- disabled or gated write controls cannot trigger live calls
- network panel shows no unexpected write calls

Required API/browser checks:

- read-only routes return expected envelopes
- write routes remain blocked without approval/provider gates
- provider mode is visible in UI and responses
- tenant/site mismatch surfaces safely

Runtime browser QA should use Playwright or equivalent in a future approved phase. It was not performed in this preflight.
