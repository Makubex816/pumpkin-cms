# Policy Handling Result

Implemented local policy handling for:

- allowed domains;
- blocked domains;
- pending-review domains;
- review-required-for-new-domains behavior.

Proof command:

```powershell
node src/outbound-link-cli.mjs set-policy --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-merged --policy fixtures/policy-blocked-domain.fixture.json --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-policy-blocked --overwrite
```

Result:

- validation: passed
- active policy: `policy_block_partner_example`
- changed links: 1
- changed instances: 1
- `partner.example` was marked `domain_blocked`
- affected instance no longer remained `enabled`.
