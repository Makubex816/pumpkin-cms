# Apex A Resolution Result

## Result

The apex A record was resolved and staged.

```text
partyrentalphiladelphia.com A 20.118.48.17
```

## Source

The IP came from Azure-supported App Service hostname external-IP readback:

```text
az webapp config hostname get-external-ip
```

Result:

```json
{ "ip": "20.118.48.17" }
```

## Other Metadata

`az webapp show` still returned:

- `inboundIpAddress`: null
- `possibleInboundIpAddresses`: null

It also returned outbound IP fields, but those were not used.

## Disallowed Values Not Used

- outbound IPs;
- DNS-resolved default-host IP;
- guessed IP;
- unrelated app IP.
