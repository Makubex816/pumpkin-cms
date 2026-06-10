# Registry Service Implementation Plan

The registry service owns canonical outbound link records.

## Local Service Responsibilities

- normalize URL;
- compute deterministic link id;
- match existing registry records;
- create proposed records for new URLs;
- apply domain policy status;
- validate outbound link records;
- expose summary counts.

## Future Runtime Responsibilities

- enforce tenant/site scope;
- support filtered queries;
- support status transitions;
- write audit logs for changes;
- support bulk action preview and execution after approval.

## Status Transition Rules

Allowed local proposal transitions:

- missing -> `pending_review` for new reviewed-required domains;
- missing -> `active` for allowed domains;
- active -> `domain_blocked` when domain policy blocks it;
- active -> `stale` only when no active instances remain.

Future write transitions require permission and audit.
