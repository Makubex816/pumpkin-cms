# Contact Form Backend Verification Packet

Status: blocked; backend verification evidence is required.

The local artifact contains a contact form on `/contact`, but local static output cannot prove that the deployed backend endpoint exists, accepts the payload, applies abuse controls, and routes leads correctly.

## Required Backend Evidence

| Evidence | Required detail |
| --- | --- |
| Endpoint approval | Exact HTTPS endpoint or approved endpoint reference, supplied by process env without protected config reads |
| Payload acceptance | Proof that the endpoint accepts the current static form payload fields |
| Required field handling | Proof required fields are enforced or safely handled |
| Lead routing | Proof submissions route to the approved owner workflow or mailbox |
| Error handling | Proof failed sends produce an approved user/operator behavior |
| Abuse controls | Confirmation of spam, bot, rate-limit, or equivalent controls |
| Privacy and retention | Confirmation of allowed submitted fields and retention behavior |
| Rollback or disable path | Approved way to disable, replace, or reroute the endpoint if staging fails |

## Current Contact Form Fields

- Name, required
- Email, required
- Phone, optional
- Event Date, required
- Event Location, required
- Venue Type, optional
- Estimated Attendance, optional
- Surface Details, optional
- Rental Goals, required

Do not query live endpoints or print endpoint values in this packet.
