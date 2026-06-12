# Expected Backend Outcome Checklist

For a future no-email dry-run POST:

- endpoint accepts `POST application/json`;
- CORS allows the selected staging origin;
- response status is `200`;
- response body contains `ok: true`;
- response message is public and generic;
- response body does not expose secrets, tokens, recipients, auth headers, connection strings, or provider details;
- response includes or omits an `entryId` without exposing private data;
- no email is sent;
- no Pumpkin API write occurs;
- no CMS/provider write occurs;
- invalid payload controls remain in force after the positive test.

For future real-email verification, dry-run success is not enough. The gate also requires approved recipient receipt and a separate email/provider approval chain.

