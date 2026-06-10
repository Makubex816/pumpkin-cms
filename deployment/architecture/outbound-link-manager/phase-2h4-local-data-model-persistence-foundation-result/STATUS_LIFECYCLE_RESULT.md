# Status Lifecycle Result

Implemented local lifecycle commands:

- `set-link-status`
- `set-instance-status`

Proof commands:

```powershell
node src/outbound-link-cli.mjs set-link-status --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-merged --link-domain partner.example --status disabled --reason "local fixture test" --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-link-disabled --overwrite
node src/outbound-link-cli.mjs set-instance-status --store .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-merged --instance-id oli_0ba33952aa6daf54 --status plain_text --reason "local fixture test" --out .tmp/phase-2h4-local-data-model-persistence-foundation/local-store-instance-plain-text --overwrite
```

Result:

- link status update validation: passed
- updated link: `ol_02ac173aecdc04a3`
- link status: `disabled`
- instance status update validation: passed
- updated instance: `oli_0ba33952aa6daf54`
- instance status: `plain_text`
- each update appended a local audit record.
