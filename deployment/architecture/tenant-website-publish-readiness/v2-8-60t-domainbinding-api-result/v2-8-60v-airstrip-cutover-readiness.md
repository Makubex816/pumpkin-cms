# V2.8.60V Airstrip Cutover Readiness

Status: not ready until DNS is applied.

Airstrip state:

- DomainBinding exists.
- DNS packet matches V2.8.60 packet.
- Read-only DNS validation is `pending`.
- Canonical is false.
- Azure hostname status is `not_started`.
- TLS status is `not_started`.
- Runtime custom-domain status is `not_started`.

V2.8.60V prerequisites:

- Owner applies Bluehost DNS records.
- Read-only DNS validation returns verified.
- Separate approval authorizes Azure hostname binding and TLS proof.

V2.8.60T did not bind custom domains.

