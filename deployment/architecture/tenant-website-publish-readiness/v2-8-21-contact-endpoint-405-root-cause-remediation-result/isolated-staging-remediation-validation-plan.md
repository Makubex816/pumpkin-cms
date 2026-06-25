# Isolated Staging Remediation Validation Plan

Result: plan created for a later phase.

Prerequisites:

- Separate approval for remediation implementation.
- Approved public static form endpoint URL.
- Server-side endpoint configuration supplied by operator without exposing secrets.
- Separate approval for isolated staging deployment.

Plan:

1. Configure the static build with only the public endpoint URL.
2. Keep all API keys, Graph credentials, recipient config, tokens, and provider secrets server-side.
3. Run static form endpoint local checks.
4. Build a sanitized Ice static artifact.
5. Verify the artifact has `renderMode: static`.
6. Verify the artifact has the expected non-secret `staticFormEndpoint`.
7. Verify the artifact still has no protected config references.
8. Deploy to isolated staging only after separate approval.
9. GET isolated staging `/contact`.
10. OPTIONS check the configured static endpoint.
11. Submit one isolated-staging synthetic POST only after separate staging POST approval.
12. Verify response status, success body, and public-safe entry/confirmation evidence.
13. Confirm backend delivery through public-safe operator evidence.

Exit criteria:

- Isolated staging contact page renders expected content.
- Configured endpoint handles OPTIONS.
- One approved isolated-staging POST returns success.
- Backend delivery is confirmed without exposing secrets.
- No production POST retry occurs until a separate production retry gate is approved.
