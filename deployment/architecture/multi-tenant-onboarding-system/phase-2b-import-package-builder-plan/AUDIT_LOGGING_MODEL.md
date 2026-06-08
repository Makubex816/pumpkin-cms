# Audit Logging Model

## Events To Log

- draft created
- draft resumed
- field changed
- owner assigned
- route added or removed
- media record added or changed
- form record added or changed
- legal/privacy status changed
- analytics decision changed
- validation run started and completed
- validation finding accepted as fixed
- package preview generated
- package exported
- support packet exported
- approval gate changed
- draft paused or unpaused

## Event Fields

- event ID
- session ID
- tenant ID
- site key
- actor ID or role
- timestamp
- action
- screen
- field path
- before value hash or safe summary
- after value hash or safe summary
- validation run ID when relevant
- reason or note

## Before/After Rules

- Public and non-secret values can be logged as summaries.
- Long content should be summarized or hashed.
- Secret-like rejected values must be logged only as `[redacted]`.
- Runtime-only fields must log presence flag changes, never values.

## Validation Logs

Record:

- validator version
- schema version
- package draft version
- overall status
- gate statuses
- finding codes
- output report paths

Do not log raw package contents by default.

## Retention Considerations

- Keep enough history to explain approvals and package exports.
- Purge rejected secret-like values immediately.
- Define retention separately for production implementation.
- Support packets should have an expiration or archival policy.
