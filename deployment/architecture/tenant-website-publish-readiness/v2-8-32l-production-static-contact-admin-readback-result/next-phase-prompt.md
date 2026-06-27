# Next Phase Prompt

Approve V2.8.32M Production Static Contact POST and Authenticated Admin FormEntry Readback only.

Objective:

Use the completed V2.8.32L preflight result to rerun the bounded production contact Admin persistence gate with an approved Admin FormEntry readback auth path. The phase may run the same approved GET health/page preflights, may preflight the Admin FormEntry read route using the approved auth mode/header/value, and may submit exactly one synthetic non-PII production POST to `https://iceskatingrinkrentals.com/api/static-contact` only if all preflight gates pass.

Required operator-provided env:

- `PUMPKIN_FORMENTRY_READBACK_AUTH_MODE`
- `PUMPKIN_FORMENTRY_READBACK_AUTH_HEADER_NAME`
- `PUMPKIN_FORMENTRY_READBACK_AUTH_VALUE`
- `PUMPKIN_CONTACT_TEST_TRACE_ID`
- `PUMPKIN_CONTACT_TEST_NAME`
- `PUMPKIN_CONTACT_TEST_EMAIL`
- `PUMPKIN_CONTACT_TEST_PHONE`
- `PUMPKIN_CONTACT_TEST_EVENT_LOCATION`
- `PUMPKIN_CONTACT_TEST_MESSAGE`
- `PUMPKIN_CONTACT_APPROVED_POST_COUNT=1`

Hard stops:

- If authenticated Admin readback preflight returns `401` or `403`, stop before POST.
- If any health/page preflight fails, stop before POST.
- If the contact page does not serialize `/api/static-contact`, stop before POST.
- Do not print auth values.
- Do not read protected config files.
- Do not deploy.
- Do not mutate app settings.
- Do not mutate Azure resources.
- Do not mutate DNS/custom domains.
- Do not run indexing.
- Do not access inbox/provider systems.
- Do not submit more than one production contact POST.
- If a POST is sent, do not retry it regardless of status.

Success condition:

The exact returned entry ID or V2.8.32M trace appears through the Pumpkin API/Admin FormEntry readback route.
