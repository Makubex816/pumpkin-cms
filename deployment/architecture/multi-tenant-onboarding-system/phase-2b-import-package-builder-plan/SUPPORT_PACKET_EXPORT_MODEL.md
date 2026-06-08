# Support Packet Export Model

## Purpose

The support packet gives an operator or support reviewer enough context to troubleshoot a draft or failed package without receiving raw secrets, protected config, or unnecessary source files.

## Include

- tenant ID and site key
- package path or draft identifier
- current wizard step
- completed/incomplete screen list
- validation report JSON and Markdown
- top blockers and non-technical explanations
- operator handoff report
- non-technical summary
- next actions
- public route list
- public domain names
- owner assignment summary
- legal/privacy and analytics decisions
- form recipient metadata without credentials
- media manifest summary without raw image bytes by default
- user-provided answers summary with redactions
- local environment summary limited to tool versions and OS family if needed

## Exclude

- passwords
- API keys
- private keys
- connection strings
- deployment tokens
- mailbox credentials
- Graph secrets
- webhook secrets
- protected config files
- raw images unless separately allowed through a safe media export
- unrelated tenant data
- raw package source files by default
- Search Console credentials or verification tokens

## Failed Validation

Support packet export must be available when validation fails. Failed packets should clearly state:

- package is not approved
- import is blocked
- external actions remain blocked
- first three blockers
- who should review next

## Redaction Rules

- Replace rejected secret-like values with `[redacted]`.
- Show field name and finding code, not secret value.
- Record whether a runtime-only item is configured using a presence flag only.
- Do not include protected local paths beyond the package/report folder path.
