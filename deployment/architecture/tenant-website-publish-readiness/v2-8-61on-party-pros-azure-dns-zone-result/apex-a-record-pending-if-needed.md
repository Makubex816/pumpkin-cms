# Apex A Record Pending

## Status

The apex A record for `partyrentalphiladelphia.com` is pending.

No apex A record was created in the Azure DNS zone.

## Reason

Starter App Service metadata did not return:

- `inboundIpAddress`;
- `possibleInboundIpAddresses`.

## Disallowed Alternatives

The ON correction explicitly forbids:

- outbound IP as an apex A value;
- guessed IP;
- unrelated app IP;
- DNS-resolved IP unless separately approved.

None of those values were used.

## Future Action

A future binding-readiness phase must retrieve a safe inbound IP from Azure App Service metadata or the Azure Custom domains blade, then create the apex A record only after owner approval.

Until this is resolved, nameserver delegation can make apex `partyrentalphiladelphia.com` fail for web traffic even though `www` and verification records are staged.
