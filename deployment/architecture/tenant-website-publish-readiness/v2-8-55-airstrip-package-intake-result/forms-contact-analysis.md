# Forms Contact Analysis

Detected flow: reservation/booking lead capture.

Primary route:

- `/request-booking`

Confirmation route:

- `/booking-confirmed`

Detected field names:

- `name`
- `email`
- `phone`
- `date`
- `time`
- `guests`
- `pickup`
- `requests`

Detected submit endpoint:

- `/api/forms/airstrip/submit/airstrip-reservation`

Required env names referenced by source:

- `NEXT_PUBLIC_API_URL`
- `PUMPKIN_API_KEY`
- `PUMPKIN_TENANT_ID`

Compatibility notes:

- This is not a simple static contact form.
- It should map to a Pumpkin FormDefinition for an Airstrip reservation form.
- The submit path aligns with the external-compatible `POST /api/forms/{tenantId}/submit/{type}` pattern, but tenant ID and form type must be normalized.
- Static contact bridge should not be reused blindly for this booking flow.

No form submission occurred.

