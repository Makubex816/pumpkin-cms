# Forbidden Information Warning

Do not place forbidden information in intake forms, answer files, generated packages, support packets, docs, chat, email, screenshots, or git.

## Forbidden

- API keys
- JWTs
- Cloudflare tokens
- Azure tokens
- Microsoft Graph secrets
- passwords
- connection strings
- storage keys
- private keys
- SMTP credentials
- OAuth refresh tokens
- login codes
- cookie values
- raw production credentials
- private customer data
- payment data
- mailbox contents
- form submission exports
- protected config files
- protected local paths
- private media URLs with token-like query strings
- private preview URLs with token-like query strings

## Stop And Ask For Help

Stop before continuing if:

- you see a credential or token
- you are asked to paste a protected config file
- a URL looks private or expires after a short time
- a file includes private customer details
- an owner asks for live CMS, DNS, Cloudflare, Azure, deployment, email, Search Console, indexing, or Roller work inside this approval gate

## Safe Replacement Rule

Use placeholders instead of unsafe values.

Examples:

- `TENANT_API_KEY_RUNTIME_ONLY`
- `FORM_ENDPOINT_RUNTIME_ONLY`
- `PUBLIC_MEDIA_URL_PENDING`
- `PRIVATE_CUSTOMER_DATA_NOT_ALLOWED`
- `PROTECTED_CONFIG_NOT_ALLOWED`
