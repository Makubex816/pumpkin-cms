# Cross-Platform URL Path Fix Reproof

Internal tenant routes are now classified with URL semantics instead of operating-system filesystem-root semantics. Leading-slash application paths and query strings are accepted. Windows drive paths, UNC/backslash paths, file URIs, traversal, control characters, and unsupported schemes are rejected.

- Windows local focused proof passed.
- The corrected Linux deployment accepted both leading-slash Vegas routes.
- Self-loop, cycle, duplicate-source, unresolved-target, and conflict checks remained active.
- No filesystem path was normalized into an application route.
