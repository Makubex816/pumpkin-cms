# Policy Handling

Local policies are stored in `outbound-link-policies.json`.

Supported policy fields:

- `allowed_domains`
- `blocked_domains`
- `pending_review_domains`
- `review_required_for_new_domains`

Policy effects:

- blocked domains become `domain_blocked` unless the link is already `disabled` or `archived`;
- instances for blocked domains cannot remain `enabled`;
- pending-review domains become `pending_review`;
- when review is required, domains outside the allowlist become `pending_review`;
- manual disabled and archived link states are preserved.

Command:

```powershell
node src/outbound-link-cli.mjs set-policy --store .tmp/local-store-merged --policy fixtures/policy-blocked-domain.fixture.json --out .tmp/local-store-policy --overwrite
```
