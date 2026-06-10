# Policy Rendering Result

Domain-blocked proof:

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-domain-blocked.fixture.json --store .tmp/phase-2h5-rendering-control-prototype/local-store-policy-blocked --out .tmp/phase-2h5-rendering-control-prototype/render-domain-blocked --overwrite
```

Result:

- validation: passed
- decisions: 1
- active anchors: 0
- blocked or disabled decisions: 1
- policy status: `domain_blocked`.

Pending-review proof:

```powershell
node src/outbound-link-cli.mjs render-fixture --fixture fixtures/render-pending-review.fixture.json --store .tmp/phase-2h5-rendering-control-prototype/pending-review-store-merged --out .tmp/phase-2h5-rendering-control-prototype/render-pending-review --overwrite
```

Result:

- validation: passed
- decisions: 1
- active anchors: 0
- blocked or disabled decisions: 1
- pending-review link rendered as plain text by default.
