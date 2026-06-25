# Synthetic Test Payload Summary

Result: prepared and submitted once.

Trace ID:

- `v2-8-20-live-contact-20260625140126`

Environment gate:

- PowerShell saw all required operator-provided env values.
- Node saw all required operator-provided env values.
- Approved post count was exactly `1`.
- Target URL was `https://iceskatingrinkrentals.com/contact`.
- Secondary target URL was present as `https://www.iceskatingrinkrentals.com/contact`.
- Expected public email matched `contact@iceskatingrinkrentals.com`.

Payload privacy:

- Synthetic name, email, phone, event location, and message values were read from env.
- Those values are not repeated in this package.
- No owner personal information was used.
- No secrets or protected config values were included.

Submitted public form keys:

- `name`
- `email`
- `phone`
- `event-date`
- `event-location`
- `venue-type`
- `estimated-attendance`
- `surface-details`
- `rental-goals`

Trace placement:

- Trace ID was included in `rental-goals`.
- Trace ID was included in `surface-details`.

Synthetic filler fields:

- `event-date`, `venue-type`, `estimated-attendance`, and `surface-details` used synthetic non-PII verification text where no dedicated env value was provided.
