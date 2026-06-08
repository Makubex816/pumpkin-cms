# Forbidden User-Supplied Information

The pilot must not collect or store secrets, private customer data, or protected local paths.

## Never Include

- API keys.
- Admin JWTs.
- Azure tokens.
- Cloudflare tokens.
- deployment tokens.
- Microsoft Graph client secrets.
- connection strings.
- storage keys.
- SAS URLs.
- passwords.
- private keys.
- SMTP credentials.
- OAuth refresh tokens.
- login codes.
- cookie values.
- protected local file paths.
- private customer lists.
- form submission exports.
- mailbox contents.
- payment data.
- booking system credentials.
- private calendar links with tokens.
- screenshots that expose tokens, secrets, private customer data, or protected config.

## URL Safety

Do not include URLs that contain token-like query parameters such as signed access values, bearer tokens, session values, or private preview links.

Use a placeholder such as `PUBLIC_MEDIA_URL_PENDING` or `FORM_ENDPOINT_RUNTIME_ONLY` when a real value is not safe for docs.

## If Forbidden Information Appears

1. Stop the pilot intake.
2. Do not copy the value into another file.
3. Record only that forbidden information was encountered.
4. Ask for a redacted replacement or approved placeholder.
5. Resume only after the unsafe value is removed from the working materials.
