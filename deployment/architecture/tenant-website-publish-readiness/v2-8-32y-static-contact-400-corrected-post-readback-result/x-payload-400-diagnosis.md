# X Payload 400 Diagnosis

Local reproduction of the X-shaped payload produced validation failures.

X-shaped payload without Origin:

- `Origin is not allowed.`
- `domainRoutingKey is not allowed for this site.`
- `recipientGroup is not allowed for this site.`

X-shaped payload with a valid Origin but literal routing values:

- `domainRoutingKey is not allowed for this site.`
- `recipientGroup is not allowed for this site.`

Diagnosis:

The X request used literal public endpoint/email routing values. Source requires allowlisted routing reference keys. X also did not send a browser-like allowed Origin header from the PowerShell POST client.

Conclusion:

The X HTTP 400 was a source-confirmed payload/request contract failure.
