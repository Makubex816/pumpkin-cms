# Remaining Blockers

- Fresh admin auth is required before optional local CMS draft import can run.
- The new PPEC repair candidates were not written to CMS during this run, so no new readback exists.
- Raw terminal preview cannot prove authenticated draft rendering because the homepage preview route loads draft data client-side with JWT.
- Final PPEC link and wording still require human approval before production approval or publish.
- Public contact and public homepage will not show draft-only candidate changes until the approved publish/static path is intentionally run later.

Not blockers for local draft candidate readiness:

- The existing PPEC source was found and normalized.
- The partner-name validator false positive is patched.
- Homepage and contact candidates validate for local draft import shape.
- Contact formBlock remains valid and intact.
