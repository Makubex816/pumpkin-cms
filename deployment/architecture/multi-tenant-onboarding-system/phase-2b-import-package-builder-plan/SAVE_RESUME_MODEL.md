# Save Resume Model

## Draft Session Behavior

The builder should save an `OnboardingSession` draft after each completed screen and after significant field groups. Save/resume should support low-skill users who need to collect missing answers from owners.

## Session States

- `not_started`
- `in_progress`
- `needs_user_input`
- `validation_failed`
- `ready_for_operator_review`
- `exported_package`
- `paused`

## Resume Rules

- Resume starts on the first incomplete or failed screen.
- Users see a checklist of completed, incomplete, failed, and blocked sections.
- Users can view previous answers unless the field is runtime-only secret or protected.
- Secret-like rejected values are never restored or displayed.

## Autosave Rules

- Autosave non-secret draft fields.
- Validate fields before marking a step complete.
- Keep a local draft version number.
- Record who edited the draft, when, and from which role.
- Never autosave passwords, tokens, private keys, connection strings, deployment tokens, or protected config values.

## Conflict Rules

- If two users edit the same session, the later save must show a conflict summary.
- Field-level conflict resolution is preferred over whole-draft overwrite.
- Owner approvals should require re-confirmation if a related field changed after approval.

## Presence Flags

Runtime-only items should use safe presence flags:

- `configured`
- `not_configured`
- `not_required`
- `unknown`

Presence flags must not reveal the secret value.

## Pause Behavior

A draft may be paused if:

- owner input is missing
- legal/privacy review is unresolved
- media rights are unclear
- another tenant appears in the package
- a secret-like value was detected
- Roller or another paused tenant appears in active content
