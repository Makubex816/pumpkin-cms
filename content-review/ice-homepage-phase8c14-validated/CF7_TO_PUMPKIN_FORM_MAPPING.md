# CF7 To Pumpkin Form Mapping

Contact Form 7 files are reference only. WordPress CF7 shortcodes, CF7 markup, CF7 mail templates, and CF7 plugin setup are not imported as live behavior.

Pumpkin mapping used:

- Form system: Pumpkin default form system.
- Form key: `default-quote-request`.
- Section type: `formBlock`.
- Section id: `homepage-quote-form`.
- Variant: `quote-form-panel`.
- Source page: `/`.
- Static endpoint ref: `ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT`.
- Lead recipient ref: `ICE_RINK_RENTALS_LEAD_RECIPIENT`.

Mapped field intent:

| CF7 field | Label | Type | Required | Pumpkin handling |
| --- | --- | --- | --- | --- |
| your-name | Full Name | text | yes | default-quote-request fullName |
| your-email | Email Address | email | yes | default-quote-request email |
| your-phone | Phone Number | tel | yes | default-quote-request phone |
| event-date | Event Date or Timeframe | text | no | default-quote-request eventDateOrDateRange |
| event-city-state | Event City / State | text | yes | split/review as eventCity + eventState intent |
| venue-name | Venue Name or Event Location | text | no | message/context field until venueName is approved as custom field |
| event-type | Event Type | select | yes | default-quote-request eventType |
| estimated-guests | Estimated Guest Count | number | no | review-only/reference |
| rink-setting | Rink Setting | select | no | default-quote-request venueSetting |
| rental-window | Rental Window / Event Hours | text | no | message/context field |
| available-space | Available Space or Surface Type | text | no | message/context field |
| event-details | Event Details | textarea | yes | default-quote-request message |
| quote-consent | Consent to be contacted | acceptance | no | review-only/reference |

Discarded CF7-only material:

- WordPress shortcode placeholder.
- CF7 form tab raw markup.
- CF7 CSS class dependency.
- CF7 admin email template as live routing.
- CF7 autoresponder template as live sending behavior.
- CF7 plugin setup instructions.

Useful wording retained:

- Form heading and intro were mapped into the Pumpkin `formBlock`.
- Success message wording was mapped into the Pumpkin `formBlock`.
- Failure messages that included unapproved public phone/email fallback were not applied as final live copy.
