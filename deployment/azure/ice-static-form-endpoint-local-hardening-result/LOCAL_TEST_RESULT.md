# Local Test Result

Commands:

```powershell
cd deployment/static-azure/forms/static-form-endpoint
npm run check
npm test
```

Results:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run check` | 0 | syntax checks passed |
| `npm test` | 0 | local handler tests passed |

Covered cases:

- frontend `staticEndpointRef`/`leadRecipientRef` aliases
- legacy `domainRoutingKey`/`recipientGroup` payload
- missing routing field default
- missing recipient field default
- invalid email rejection
- oversized message rejection
- filled honeypot rejection
- unknown routing ref rejection without echoing it
- unknown recipient ref rejection without echoing it
- script-like message sanitization before mocked backend forward

The successful forward path used a mocked backend `fetchImpl`. No email was sent.

