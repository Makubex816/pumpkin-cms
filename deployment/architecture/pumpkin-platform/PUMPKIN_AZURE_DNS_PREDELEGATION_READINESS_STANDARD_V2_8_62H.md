# Pumpkin Azure DNS Predelegation Readiness Standard V2.8.62H

Azure DNS predelegation prepares a complete inactive zone before a customer-controlled registrar change. It is not a launch or delegation action.

## Gates

Before zone mutation:

1. Prove the tenant/domain association from Pumpkin metadata.
2. Inventory current NS, SOA, A, AAAA, CNAME, TXT, MX, CAA, DS, and TTL state through multiple public resolvers.
3. Confirm the approved subscription, resource group, and absence or safe adoption state.
4. Confirm application runtime health and empty git staging.

Before staging records:

1. Read an Azure-supported external inbound address; never use outbound or guessed IPs.
2. Read the exact default hostname and current custom-domain verification ID.
3. Stop on unexplained record conflicts.
4. Leave unsupported or unavailable targets pending instead of guessing.

## Proof

Require:

- four distinct Azure-assigned nameservers;
- exact zone tags and resource identity;
- management-plane record readback;
- direct authoritative SOA, NS, and staged-record agreement from all four nameservers;
- explicit email DNS classification;
- explicit parent DS classification;
- unchanged current public delegation;
- no-regression runtime proof.

If local port 53 is intercepted or blocked, use a documented remote query executor that targets each assigned server and reports the authoritative bit. Do not substitute recursive public-delegation output for direct authority proof.

## Holds

Predelegation never authorizes:

- registrar login or nameserver mutation;
- custom hostname binding or TLS;
- deploy or appsetting changes;
- publication, indexing, runtime-key use, or form submission.

Manual delegation requires a separately approved packet containing all four target nameservers, current rollback values, email and DNSSEC disposition, owner authorization, and a validation/rollback window.
