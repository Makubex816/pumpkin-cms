# No-Secrets Agreement

Before the first real tenant dry-run approval, the user must acknowledge this checklist.

The dry run uses local files and reports. Those files must not contain secrets or private customer data.

## User Acknowledgement

Check each item before approval.

- [ ] I will not provide API keys.
- [ ] I will not provide JWTs.
- [ ] I will not provide Cloudflare tokens.
- [ ] I will not provide Azure tokens.
- [ ] I will not provide Microsoft Graph secrets.
- [ ] I will not provide passwords.
- [ ] I will not provide connection strings.
- [ ] I will not provide storage keys.
- [ ] I will not provide private keys.
- [ ] I will not provide SMTP credentials.
- [ ] I will not provide private customer data.
- [ ] I will not provide protected config files.
- [ ] I will not provide raw production credentials.
- [ ] I will not provide mailbox contents.
- [ ] I will not provide form submission exports.
- [ ] I will not provide private links that contain access tokens.
- [ ] I will use placeholders when a real value is not safe.
- [ ] I will stop and ask for help if I am unsure whether something is safe.

## Safe Placeholder Examples

| Unsafe Thing | Safe Placeholder |
| --- | --- |
| Runtime tenant API key value | `TENANT_API_KEY_RUNTIME_ONLY` |
| Form delivery endpoint credential | `FORM_ENDPOINT_RUNTIME_ONLY` |
| Cloudflare credential | `CLOUDFLARE_RUNTIME_ONLY` |
| Azure credential | `AZURE_RUNTIME_ONLY` |
| Microsoft Graph credential | `GRAPH_RUNTIME_ONLY` |
| Private media link | `PUBLIC_MEDIA_URL_PENDING` |

## Signature

| Field | Answer |
| --- | --- |
| Candidate tenant | |
| User name | |
| Date acknowledged | |
| Notes | |
