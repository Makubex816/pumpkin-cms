# Risk and Open Decisions

## Risks

Current production form delivery remains unverified:

- The public static artifact has no configured submit endpoint.
- `/api/contact` is not backed by a deployed handler in the static artifact.
- The public mailto fallback remains visible, but form delivery is not verified.

Future route ambiguity:

- Runtime Next source uses `/api/contact`.
- Static function scaffold uses `/api/static-contact`.
- Local test server accepts `/api/contact` for compatibility only.
- A future production endpoint path decision is required before remediation.

Validator mismatch:

- The release-specific V2.8.19H validator path allowed public mailto-only launch.
- The stricter static validators correctly block static form readiness when endpoint configuration is missing, but also still enforce older media-origin policy that was intentionally scoped around in V2.8.19H.

## Open Decisions

- Should the first deployed public static endpoint be `/api/static-contact` only?
- Should a `/api/contact` compatibility route be added to the deployable function?
- Should production static release validation be tightened so contact-form pages cannot proceed with only warnings when live form delivery is in scope?
- Which backend delivery mode should be used first: Pumpkin FormEntry, Microsoft Graph/email, or another approved provider?
- When should the next live production POST retry be approved?
