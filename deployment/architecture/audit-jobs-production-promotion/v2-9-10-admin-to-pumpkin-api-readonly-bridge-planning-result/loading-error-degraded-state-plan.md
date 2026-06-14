# Loading Error Degraded State Plan

Loading state:

- show existing Audit Jobs shell with disabled future actions;
- show provider mode as `admin-api-readonly` pending;
- keep read-only banner visible;
- do not render mutation affordances while loading.

Error state:

- contract/auth/tenant errors should show a redacted error message;
- include API `requestId` and `correlationId` if present;
- include status and code but not headers, tokens, connection material, or protected config names;
- keep fixture fallback available.

Degraded state:

- render fixture-backed snapshot;
- show provider mode as fallback from `admin-api-readonly` to `admin-local-fixture-readonly`;
- show fallback reason code;
- keep Google indexing deferred warning;
- keep all future actions disabled.

Fatal state:

- only if both API and fixture contract fail;
- show read-only error panel with no record table mutation controls;
- do not retry broadly or call external services.

