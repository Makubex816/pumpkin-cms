# Next Phase Prompt

Approve V2.8.34A corrected static contact key rotation retry only.

Carryforward:

- V2.8.34 generated a fresh key, rotated the `ice-rink-rentals` Tenant auth record, and bound isolated SWA appsettings.
- The single isolated verification POST returned HTTP 400.
- Isolated Admin readback did not find trace `v2-8-34-isolated-key-rotation-20260629045108-9b13ff26`.
- Tenant record and isolated key binding were rolled back.
- Production was not touched.
- Owner hard-copy and checksum were created outside the repo.

Corrective focus:

- Use the source-required Pumpkin API `FormSubmissionGuard` payload contract for `default-quote-request`.
- Required `formData` keys are `fullName`, `email`, `phone`, `eventCity`, `eventState`, `eventDateOrDateRange`, `eventType`, `venueSetting`, `message`, and `consent`.
- Do not reuse the simplified prompt payload shape that caused the likely upstream HTTP 400.

Hard stops:

- No deploy.
- No DNS/custom-domain mutation.
- No Search Console/indexing.
- No protected config read outside approved ignored secure files.
- No secret values printed or written to repo.
- No more than one isolated verification POST.
- No production appsetting mutation or production POST unless isolated verification succeeds.
- No `git add -A`.
