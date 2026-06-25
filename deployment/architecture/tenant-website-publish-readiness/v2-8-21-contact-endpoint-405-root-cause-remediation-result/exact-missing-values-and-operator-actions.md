# Exact Missing Values and Operator Actions

Result: operator actions documented.

Missing or externally controlled values:

- Approved public static form endpoint URL.
- Confirmation whether the future endpoint path should be `/api/static-contact`, `/api/contact`, or both.
- Static endpoint allowed origins for:
  - `https://iceskatingrinkrentals.com`
  - `https://www.iceskatingrinkrentals.com`
  - isolated staging host after selection
- Server-side Pumpkin API forwarding settings, if FormEntry persistence is used.
- Server-side Microsoft Graph/email settings, if email delivery is used.
- Approved backend recipient ref/destination, without exposing private credentials.
- Backend delivery confirmation for V2.8.20 trace ID, if available.

Operator actions:

1. Decide whether the first remediation target is the existing static function path `/api/static-contact` or a new `/api/contact` compatibility route.
2. Provide only the approved public endpoint URL for static build configuration.
3. Keep all keys, tokens, app settings, recipient secrets, and provider credentials outside repo and outside Codex output.
4. Approve endpoint deployment/linking if the endpoint is not already live.
5. Approve a static rebuild and isolated staging deployment after endpoint readiness.
6. Approve a staging POST test only after isolated staging preflight passes.
7. Approve a production live POST retry only after isolated staging and backend delivery pass.

Do not provide:

- Deployment tokens.
- API keys.
- Microsoft Graph client secrets.
- Connection strings.
- SAS values.
- Inbox credentials.
- Private mailbox credentials.
