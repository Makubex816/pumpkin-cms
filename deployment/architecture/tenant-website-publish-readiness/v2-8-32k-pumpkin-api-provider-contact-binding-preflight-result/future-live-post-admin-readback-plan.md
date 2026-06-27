# Future Live POST And Admin Readback Plan

Next phase objective:

Run a separately approved V2.8.32L live contact POST plus Admin FormEntry readback gate.

Proposed constraints:

- Submit exactly one approved no-PII production contact POST to `https://iceskatingrinkrentals.com/api/static-contact`.
- Use tenant `ice-rink-rentals`.
- Use form ID `default-quote-request`.
- Capture the returned `entryId` and trace-safe metadata only.
- Read back Admin FormEntry data only through an approved Admin route/auth path.
- Confirm the exact `entryId` is visible in Admin.
- Do not deploy, redeploy, mutate app settings, mutate DNS, or run indexing in the live readback gate.

Success condition:

The exact production contact submission appears as a Pumpkin `FormEntry` in the Admin-readable backend.
